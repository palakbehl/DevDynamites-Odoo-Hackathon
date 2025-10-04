const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'expense_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, companyName, country, currency } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create company first
    const companyResult = await pool.query(
      'INSERT INTO companies (name, country, default_currency) VALUES ($1, $2, $3) RETURNING *',
      [companyName, country, currency]
    );
    const company = companyResult.rows[0];

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, fullName, company.id]
    );
    const user = userResult.rows[0];

    // Create admin role
    await pool.query(
      'INSERT INTO user_roles (user_id, role, company_id) VALUES ($1, $2, $3)',
      [user.id, 'admin', company.id]
    );

    // Create default expense categories
    const categories = ['Travel', 'Meals', 'Office Supplies', 'Entertainment', 'Transportation', 'Lodging'];
    for (const categoryName of categories) {
      await pool.query(
        'INSERT INTO expense_categories (name, company_id) VALUES ($1, $2)',
        [categoryName, company.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_id: user.company_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
      role: 'admin',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user role
    const roleResult = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
    const role = roleResult.rows[0]?.role || 'employee';

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_id: user.company_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
      role,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user role
    const roleResult = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
    const role = roleResult.rows[0]?.role || 'employee';

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      company_id: user.company_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Get current user's company
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    // Get all users in the same company
    const usersResult = await pool.query(
      'SELECT id, email, full_name, company_id, created_at, updated_at FROM users WHERE company_id = $1',
      [companyId]
    );

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      usersResult.rows.map(async (user) => {
        const roleResult = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
        return {
          ...user,
          role: roleResult.rows[0]?.role || 'employee',
        };
      })
    );

    res.json(usersWithRoles);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Get current user's company
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUserResult = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, fullName, companyId]
    );
    const newUser = newUserResult.rows[0];

    // Create user role
    await pool.query(
      'INSERT INTO user_roles (user_id, role, company_id) VALUES ($1, $2, $3)',
      [newUser.id, role, companyId]
    );

    res.json({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      company_id: newUser.company_id,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Expense routes
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const expensesResult = await pool.query(
      'SELECT * FROM expenses WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );

    res.json(expensesResult.rows);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { category_id, amount, original_amount, original_currency, company_currency, description, expense_date } = req.body;

    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const expenseResult = await pool.query(
      `INSERT INTO expenses (user_id, company_id, category_id, amount, original_amount, 
       original_currency, company_currency, description, expense_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.userId, companyId, category_id, amount, original_amount, original_currency, company_currency, description, expense_date, 'pending']
    );

    res.json(expenseResult.rows[0]);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/expenses/pending', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const expensesResult = await pool.query(
      'SELECT * FROM expenses WHERE company_id = $1 AND status = $2 ORDER BY created_at DESC',
      [companyId, 'pending']
    );

    res.json(expensesResult.rows);
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending expenses for a specific approver (multi-level approval)
app.get('/api/expenses/pending-for-approver', authenticateToken, async (req, res) => {
  try {
    // Get expenses that need approval from this user
    const expensesResult = await pool.query(
      `SELECT e.*, u.full_name as submitter_name, ec.name as category_name
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       JOIN expense_approvals ea ON e.id = ea.expense_id
       WHERE ea.approver_id = $1 AND ea.status = 'pending'
       ORDER BY e.created_at DESC`,
      [req.user.userId]
    );

    res.json(expensesResult.rows);
  } catch (error) {
    console.error('Get pending expenses for approver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval chain for a company
app.get('/api/approval-chains', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const chainsResult = await pool.query(
      'SELECT * FROM approval_chains WHERE company_id = $1 ORDER BY sequence_order',
      [companyId]
    );

    res.json(chainsResult.rows);
  } catch (error) {
    console.error('Get approval chains error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create approval chain
app.post('/api/approval-chains', authenticateToken, async (req, res) => {
  try {
    const { approverRole, sequenceOrder } = req.body;
    
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const chainResult = await pool.query(
      'INSERT INTO approval_chains (company_id, approver_role, sequence_order) VALUES ($1, $2, $3) RETURNING *',
      [companyId, approverRole, sequenceOrder]
    );

    res.json(chainResult.rows[0]);
  } catch (error) {
    console.error('Create approval chain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get manager relationships
app.get('/api/manager-relationships', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const relationshipsResult = await pool.query(
      'SELECT * FROM manager_relationships WHERE company_id = $1',
      [companyId]
    );

    res.json(relationshipsResult.rows);
  } catch (error) {
    console.error('Get manager relationships error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create manager relationship
app.post('/api/manager-relationships', authenticateToken, async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const relationshipResult = await pool.query(
      'INSERT INTO manager_relationships (employee_id, manager_id, company_id) VALUES ($1, $2, $3) RETURNING *',
      [employeeId, managerId, companyId]
    );

    res.json(relationshipResult.rows[0]);
  } catch (error) {
    console.error('Create manager relationship error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete manager relationship
app.delete('/api/manager-relationships/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM manager_relationships WHERE id = $1', [id]);

    res.json({ message: 'Manager relationship deleted' });
  } catch (error) {
    console.error('Delete manager relationship error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense approvals
app.get('/api/expense-approvals/:expenseId', authenticateToken, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const approvalsResult = await pool.query(
      'SELECT * FROM expense_approvals WHERE expense_id = $1 ORDER BY sequence_order',
      [expenseId]
    );

    res.json(approvalsResult.rows);
  } catch (error) {
    console.error('Get expense approvals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense approval status
app.patch('/api/expense-approvals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    // Update the approval status
    await pool.query(
      'UPDATE expense_approvals SET status = $1, comments = $2, updated_at = NOW() WHERE id = $3',
      [status, comments, id]
    );

    // Check if we need to move to the next approver or finalize the expense
    const approvalResult = await pool.query('SELECT * FROM expense_approvals WHERE id = $1', [id]);
    const approval = approvalResult.rows[0];
    
    const expenseResult = await pool.query('SELECT * FROM expenses WHERE id = $1', [approval.expense_id]);
    const expense = expenseResult.rows[0];
    
    // Get all approvals for this expense
    const allApprovalsResult = await pool.query(
      'SELECT * FROM expense_approvals WHERE expense_id = $1 ORDER BY sequence_order',
      [expense.id]
    );
    const allApprovals = allApprovalsResult.rows;
    
    // Check if all approvals are completed
    const allApproved = allApprovals.every(approval => approval.status === 'approved');
    const anyRejected = allApprovals.some(approval => approval.status === 'rejected');
    
    // Check for conditional approval rules
    const rulesResult = await pool.query(
      `SELECT ar.* 
       FROM approval_rules ar
       JOIN expense_approval_rules ear ON ar.id = ear.approval_rule_id
       WHERE ear.expense_id = $1`,
      [expense.id]
    );
    const rules = rulesResult.rows;
    
    // Check if any conditional rules are met
    let conditionalApproved = false;
    for (const rule of rules) {
      if (rule.rule_type === 'specific_approver' && approval.approver_id === rule.specific_approver_id && status === 'approved') {
        conditionalApproved = true;
        break;
      } else if (rule.rule_type === 'percentage') {
        const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
        const percentage = (approvedCount / allApprovals.length) * 100;
        if (percentage >= rule.percentage_threshold) {
          conditionalApproved = true;
          break;
        }
      } else if (rule.rule_type === 'hybrid') {
        // Check if specific approver approved OR percentage threshold met
        const specificApproved = rule.specific_approver_id && 
          allApprovals.some(a => a.approver_id === rule.specific_approver_id && a.status === 'approved');
        
        const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
        const percentage = (approvedCount / allApprovals.length) * 100;
        const percentageMet = percentage >= rule.percentage_threshold;
        
        if (specificApproved || percentageMet) {
          conditionalApproved = true;
          break;
        }
      }
    }
    
    if (allApproved || conditionalApproved) {
      // All approvals completed or conditional rule met, mark expense as approved
      await pool.query(
        'UPDATE expenses SET status = $1, updated_at = NOW() WHERE id = $2',
        ['approved', expense.id]
      );
    } else if (anyRejected) {
      // At least one rejection, mark expense as rejected
      await pool.query(
        'UPDATE expenses SET status = $1, updated_at = NOW() WHERE id = $2',
        ['rejected', expense.id]
      );
    } else {
      // Move to next approver if this was approved
      if (status === 'approved') {
        const nextApprover = allApprovals.find(
          app => app.sequence_order === approval.sequence_order + 1 && app.status === 'pending'
        );
        
        if (nextApprover) {
          // Next approver exists, they will get notified
          // In a real implementation, you would send a notification here
        }
      }
    }

    res.json({ message: 'Approval status updated' });
  } catch (error) {
    console.error('Update expense approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval rules for a company
app.get('/api/approval-rules', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const rulesResult = await pool.query(
      'SELECT * FROM approval_rules WHERE company_id = $1',
      [companyId]
    );

    res.json(rulesResult.rows);
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create approval rule
app.post('/api/approval-rules', authenticateToken, async (req, res) => {
  try {
    const { ruleType, percentageThreshold, specificApproverId, description } = req.body;
    
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const ruleResult = await pool.query(
      `INSERT INTO approval_rules 
       (company_id, rule_type, percentage_threshold, specific_approver_id, description) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, ruleType, percentageThreshold, specificApproverId, description]
    );

    res.json(ruleResult.rows[0]);
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update approval rule
app.patch('/api/approval-rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ruleType, percentageThreshold, specificApproverId, description, isActive } = req.body;

    const ruleResult = await pool.query(
      `UPDATE approval_rules 
       SET rule_type = $1, percentage_threshold = $2, specific_approver_id = $3, 
           description = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [ruleType, percentageThreshold, specificApproverId, description, isActive, id]
    );

    res.json(ruleResult.rows[0]);
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete approval rule
app.delete('/api/approval-rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM approval_rules WHERE id = $1', [id]);

    res.json({ message: 'Approval rule deleted' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link expense with approval rules
app.post('/api/expense-approval-rules', authenticateToken, async (req, res) => {
  try {
    const { expenseId, approvalRuleId } = req.body;

    const linkResult = await pool.query(
      'INSERT INTO expense_approval_rules (expense_id, approval_rule_id) VALUES ($1, $2) RETURNING *',
      [expenseId, approvalRuleId]
    );

    res.json(linkResult.rows[0]);
  } catch (error) {
    console.error('Link expense with approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval rules for an expense
app.get('/api/expense-approval-rules/:expenseId', authenticateToken, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const rulesResult = await pool.query(
      `SELECT ar.* 
       FROM approval_rules ar
       JOIN expense_approval_rules ear ON ar.id = ear.approval_rule_id
       WHERE ear.expense_id = $1`,
      [expenseId]
    );

    res.json(rulesResult.rows);
  } catch (error) {
    console.error('Get expense approval rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload route for receipt processing
app.post('/api/expenses/receipt-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real application, you would process the receipt here with OCR
    // For now, we'll return mock data
    const mockOcrData = {
      amount: "42.50",
      currency: "USD",
      date: new Date().toISOString().split('T')[0],
      merchant: "Sample Merchant",
      category: "Meals"
    };

    // Return the file info and mock OCR data
    res.json({
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      },
      ocrData: mockOcrData
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Company routes
app.get('/api/company', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
    res.json(companyResult.rows[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/company', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;
    
    const { name, country, default_currency } = req.body;

    const companyResult = await pool.query(
      'UPDATE companies SET name = $1, country = $2, default_currency = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, country, default_currency, companyId]
    );
    
    res.json(companyResult.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Category routes
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const categoriesResult = await pool.query('SELECT * FROM expense_categories WHERE company_id = $1', [companyId]);
    res.json(categoriesResult.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userResult = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.userId]);
    const companyId = userResult.rows[0].company_id;

    const categoryResult = await pool.query(
      'INSERT INTO expense_categories (name, company_id) VALUES ($1, $2) RETURNING *',
      [name, companyId]
    );

    res.json(categoryResult.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});