const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const Expense = require('./models/Expense');
const ExpenseCategory = require('./models/ExpenseCategory');
const ManagerRelationship = require('./models/ManagerRelationship');
const ExpenseApproval = require('./models/ExpenseApproval');
const ApprovalChain = require('./models/ApprovalChain');
const ApprovalRule = require('./models/ApprovalRule');
const ExpenseApprovalRule = require('./models/ExpenseApprovalRule');

// Connect to MongoDB
require('./config/db')();

const app = express();
const PORT = process.env.PORT || 3003;

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure nodemailer for email sending
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASS || 'your-email-password',
  },
});

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

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@example.com',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, companyName, country, currency } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create company first
    const company = new Company({
      name: companyName,
      country,
      default_currency: currency,
    });
    await company.save();

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      company_id: company._id,
      role: 'admin', // First user is admin
    });
    await user.save();

    // Create default expense categories
    const categories = ['Travel', 'Meals', 'Office Supplies', 'Entertainment', 'Transportation', 'Lodging'];
    for (const categoryName of categories) {
      const category = new ExpenseCategory({
        name: categoryName,
        company_id: company._id,
      });
      await category.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user._id,
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        company_id: user.company_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
      role: user.role,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      company_id: user.company_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: user.role,
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
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all users in the same company
    const users = await User.find({ company_id: currentUser.company_id });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Get current user's company
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate a temporary password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-8);
    
    // Hash password and create user
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const newUser = new User({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      company_id: currentUser.company_id,
      role,
    });
    await newUser.save();

    // Send email with credentials
    const emailHtml = `
      <h2>Welcome to SmartExpense</h2>
      <p>Hello ${fullName},</p>
      <p>An admin has created an account for you. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password for security.</p>
      <p><a href="http://localhost:3000/auth?mode=signin">Login to your account</a></p>
    `;
    
    await sendEmail(email, 'SmartExpense Account Created', emailHtml);

    res.json({
      id: newUser._id,
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
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expenses = await Expense.find({ company_id: currentUser.company_id })
      .sort({ created_at: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { category_id, amount, original_amount, original_currency, company_currency, description, expense_date } = req.body;

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expense = new Expense({
      user_id: currentUser._id,
      company_id: currentUser.company_id,
      category_id,
      amount,
      original_amount,
      original_currency,
      company_currency,
      description,
      expense_date,
      status: 'pending'
    });

    await expense.save();

    // Create approval workflow
    await createApprovalWorkflow(expense, currentUser);

    res.json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/expenses/pending', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expenses = await Expense.find({ 
      company_id: currentUser.company_id, 
      status: 'pending' 
    }).sort({ created_at: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending expenses for a specific approver (multi-level approval)
app.get('/api/expenses/pending-for-approver', authenticateToken, async (req, res) => {
  try {
    // Get expenses that need approval from this user
    const approvals = await ExpenseApproval.find({ 
      approver_id: req.user.userId, 
      status: 'pending' 
    }).populate({
      path: 'expense_id',
      populate: [
        { path: 'user_id', select: 'full_name email' },
        { path: 'category_id', select: 'name' }
      ]
    });

    // Map approvals to include full expense details with user and category info
    const expenses = approvals.map(approval => {
      const expense = approval.expense_id;
      return {
        ...expense.toObject(),
        full_name: expense.user_id ? expense.user_id.full_name : 'Unknown User',
        category: expense.category_id ? expense.category_id.name : 'General',
        approval_id: approval._id,
        approval_status: approval.status,
        approval_sequence: approval.sequence_order
      };
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get pending expenses for approver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval chain for a company
app.get('/api/approval-chains', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chains = await ApprovalChain.find({ company_id: currentUser.company_id })
      .sort({ sequence_order: 1 });

    res.json(chains);
  } catch (error) {
    console.error('Get approval chains error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create approval chain
app.post('/api/approval-chains', authenticateToken, async (req, res) => {
  try {
    const { approverRole, sequenceOrder } = req.body;
    
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chain = new ApprovalChain({
      company_id: currentUser.company_id,
      approver_role: approverRole,
      sequence_order: sequenceOrder
    });

    await chain.save();

    res.json(chain);
  } catch (error) {
    console.error('Create approval chain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete approval chain
app.delete('/api/approval-chains/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await ApprovalChain.findByIdAndDelete(id);

    res.json({ message: 'Approval chain deleted' });
  } catch (error) {
    console.error('Delete approval chain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get manager relationships
app.get('/api/manager-relationships', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const relationships = await ManagerRelationship.find({ company_id: currentUser.company_id });

    res.json(relationships);
  } catch (error) {
    console.error('Get manager relationships error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create manager relationship
app.post('/api/manager-relationships', authenticateToken, async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const relationship = new ManagerRelationship({
      employee_id: employeeId,
      manager_id: managerId,
      company_id: currentUser.company_id
    });

    await relationship.save();

    res.json(relationship);
  } catch (error) {
    console.error('Create manager relationship error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete manager relationship
app.delete('/api/manager-relationships/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await ManagerRelationship.findByIdAndDelete(id);

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

    const approvals = await ExpenseApproval.find({ expense_id: expenseId })
      .sort({ sequence_order: 1 });

    res.json(approvals);
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
    const approval = await ExpenseApproval.findByIdAndUpdate(
      id,
      { status, comments, updated_at: new Date() },
      { new: true }
    );

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Check if we need to move to the next approver or finalize the expense
    const expense = await Expense.findById(approval.expense_id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    // Get all approvals for this expense
    const allApprovals = await ExpenseApproval.find({ expense_id: expense._id })
      .sort({ sequence_order: 1 });
    
    // Get approval rules for this expense
    const expenseApprovalRules = await ExpenseApprovalRule.find({ expense_id: expense._id })
      .populate('approval_rule_id');
    
    // Check if any conditional rules apply
    let shouldApprove = false;
    let shouldReject = false;
    
    // Check each approval rule
    for (const expenseRule of expenseApprovalRules) {
      const rule = expenseRule.approval_rule_id;
      if (!rule.is_active) continue;
      
      switch (rule.rule_type) {
        case 'specific_approver':
          // If specific approver approves, auto-approve
          if (rule.specific_approver_id && rule.specific_approver_id.toString() === req.user.userId) {
            shouldApprove = true;
          }
          break;
        case 'percentage':
          // Check if percentage threshold is met
          if (rule.percentage_threshold) {
            const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
            const totalApprovers = allApprovals.length;
            const percentageApproved = (approvedCount / totalApprovers) * 100;
            
            if (percentageApproved >= rule.percentage_threshold) {
              shouldApprove = true;
            }
          }
          break;
        case 'hybrid':
          // Check both percentage and specific approver
          if (rule.specific_approver_id && rule.specific_approver_id.toString() === req.user.userId) {
            shouldApprove = true;
          } else if (rule.percentage_threshold) {
            const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
            const totalApprovers = allApprovals.length;
            const percentageApproved = (approvedCount / totalApprovers) * 100;
            
            if (percentageApproved >= rule.percentage_threshold) {
              shouldApprove = true;
            }
          }
          break;
      }
    }
    
    // Check if all approvals are completed (standard workflow)
    const allApproved = allApprovals.every(approval => approval.status === 'approved');
    const anyRejected = allApprovals.some(approval => approval.status === 'rejected');
    
    // Enhanced logic for conditional approvals
    if (shouldApprove) {
      // Conditional rule met, mark expense as approved
      await Expense.findByIdAndUpdate(expense._id, { status: 'approved', updated_at: new Date() });
    } else if (shouldReject) {
      // Conditional rule for rejection met, mark expense as rejected
      await Expense.findByIdAndUpdate(expense._id, { status: 'rejected', updated_at: new Date() });
    } else if (allApproved) {
      // All approvals completed in standard workflow, mark expense as approved
      await Expense.findByIdAndUpdate(expense._id, { status: 'approved', updated_at: new Date() });
    } else if (anyRejected) {
      // At least one rejection in standard workflow, mark expense as rejected
      await Expense.findByIdAndUpdate(expense._id, { status: 'rejected', updated_at: new Date() });
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
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rules = await ApprovalRule.find({ company_id: currentUser.company_id });

    res.json(rules);
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create approval rule
app.post('/api/approval-rules', authenticateToken, async (req, res) => {
  try {
    const { ruleType, percentageThreshold, specificApproverId, description } = req.body;
    
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rule = new ApprovalRule({
      company_id: currentUser.company_id,
      rule_type: ruleType,
      percentage_threshold: percentageThreshold,
      specific_approver_id: specificApproverId,
      description
    });

    await rule.save();

    res.json(rule);
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

    const rule = await ApprovalRule.findByIdAndUpdate(
      id,
      {
        rule_type: ruleType,
        percentage_threshold: percentageThreshold,
        specific_approver_id: specificApproverId,
        description,
        is_active: isActive,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete approval rule
app.delete('/api/approval-rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await ApprovalRule.findByIdAndDelete(id);

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

    const link = new ExpenseApprovalRule({
      expense_id: expenseId,
      approval_rule_id: approvalRuleId
    });

    await link.save();

    res.json(link);
  } catch (error) {
    console.error('Link expense with approval rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval rules for an expense
app.get('/api/expense-approval-rules/:expenseId', authenticateToken, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const rules = await ExpenseApprovalRule.find({ expense_id: expenseId })
      .populate('approval_rule_id');

    res.json(rules.map(rule => rule.approval_rule_id));
  } catch (error) {
    console.error('Get expense approval rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to create approval workflow
async function createApprovalWorkflow(expense, currentUser) {
  try {
    // Get approval chain for the company
    const approvalChains = await ApprovalChain.find({ company_id: currentUser.company_id })
      .sort({ sequence_order: 1 });
    
    // Get manager relationship for this employee
    const managerRelationship = await ManagerRelationship.findOne({ 
      employee_id: currentUser._id, 
      company_id: currentUser.company_id 
    });
    
    // Get active approval rules for the company
    const approvalRules = await ApprovalRule.find({ 
      company_id: currentUser.company_id, 
      is_active: true 
    });
    
    // Link expense with approval rules
    for (const rule of approvalRules) {
      const expenseApprovalRule = new ExpenseApprovalRule({
        expense_id: expense._id,
        approval_rule_id: rule._id
      });
      
      await expenseApprovalRule.save();
    }
    
    // Create approval records for each approver in the chain
    for (const chain of approvalChains) {
      let approverId = null;
      
      // Determine approver based on role
      if (chain.approver_role === 'employee') {
        approverId = expense.user_id;
      } else if (chain.approver_role === 'manager') {
        // For manager role, use the employee's manager
        if (managerRelationship) {
          approverId = managerRelationship.manager_id;
        }
      } else if (chain.approver_role === 'admin') {
        // For admin role, find an admin in the company
        const adminUser = await User.findOne({ 
          company_id: currentUser.company_id, 
          role: 'admin' 
        });
        if (adminUser) {
          approverId = adminUser._id;
        }
      }
      
      // Create approval record if we found an approver
      if (approverId) {
        const expenseApproval = new ExpenseApproval({
          expense_id: expense._id,
          approver_id: approverId,
          sequence_order: chain.sequence_order
        });
        
        await expenseApproval.save();
      }
    }
  } catch (error) {
    console.error('Error creating approval workflow:', error);
  }
}

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
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const company = await Company.findById(currentUser.company_id);
    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/company', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, country, default_currency } = req.body;

    const company = await Company.findByIdAndUpdate(
      currentUser.company_id,
      { name, country, default_currency, updated_at: new Date() },
      { new: true }
    );
    
    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Category routes
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const categories = await ExpenseCategory.find({ company_id: currentUser.company_id });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const category = new ExpenseCategory({
      name,
      company_id: currentUser.company_id,
    });

    await category.save();

    res.json(category);
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