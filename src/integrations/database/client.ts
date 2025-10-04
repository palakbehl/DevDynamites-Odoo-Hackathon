import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection configuration
const pool = new Pool({
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'expense_management',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'password',
  ssl: import.meta.env.VITE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// JWT secret for token generation
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'employee';
  company_id: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  company_id: string;
  category_id?: string;
  amount: number;
  original_amount: number;
  original_currency: string;
  company_currency: string;
  description: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  company_id: string;
  created_at: string;
}

export interface ManagerRelationship {
  id: string;
  employee_id: string;
  manager_id: string;
  company_id: string;
  created_at: string;
}

export interface ApprovalChain {
  id: string;
  company_id: string;
  approver_role: 'admin' | 'manager' | 'employee';
  sequence_order: number;
  created_at: string;
}

export interface ExpenseApproval {
  id: string;
  expense_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

// Database client class
export class DatabaseClient {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // User authentication methods
  async createUser(email: string, password: string, fullName: string, companyId: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await this.query(
      'INSERT INTO users (email, password_hash, full_name, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, fullName, companyId]
    );
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async createUserRole(userId: string, role: 'admin' | 'manager' | 'employee', companyId: string): Promise<UserRole> {
    const result = await this.query(
      'INSERT INTO user_roles (user_id, role, company_id) VALUES ($1, $2, $3) RETURNING *',
      [userId, role, companyId]
    );
    return result.rows[0];
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const result = await this.query('SELECT * FROM user_roles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  // Company methods
  async createCompany(name: string, country: string, defaultCurrency: string): Promise<Company> {
    const result = await this.query(
      'INSERT INTO companies (name, country, default_currency) VALUES ($1, $2, $3) RETURNING *',
      [name, country, defaultCurrency]
    );
    return result.rows[0];
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const result = await this.query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Expense methods
  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const result = await this.query(
      `INSERT INTO expenses (user_id, company_id, category_id, amount, original_amount, 
       original_currency, company_currency, description, expense_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        expense.user_id, expense.company_id, expense.category_id, expense.amount,
        expense.original_amount, expense.original_currency, expense.company_currency,
        expense.description, expense.expense_date, expense.status
      ]
    );
    return result.rows[0];
  }

  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    const result = await this.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  async getPendingExpenses(companyId: string): Promise<Expense[]> {
    const result = await this.query(
      'SELECT * FROM expenses WHERE company_id = $1 AND status = $2 ORDER BY created_at DESC',
      [companyId, 'pending']
    );
    return result.rows;
  }

  async updateExpenseStatus(expenseId: string, status: 'approved' | 'rejected'): Promise<void> {
    await this.query(
      'UPDATE expenses SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, expenseId]
    );
  }

  // User management methods
  async getUsersByCompany(companyId: string): Promise<User[]> {
    const result = await this.query('SELECT * FROM users WHERE company_id = $1', [companyId]);
    return result.rows;
  }

  async getUserWithRole(userId: string): Promise<(User & { role: string }) | null> {
    const result = await this.query(`
      SELECT u.*, ur.role 
      FROM users u 
      LEFT JOIN user_roles ur ON u.id = ur.user_id 
      WHERE u.id = $1
    `, [userId]);
    return result.rows[0] || null;
  }

  // JWT token methods
  generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  // Close the connection pool
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export a singleton instance
export const db = new DatabaseClient();
