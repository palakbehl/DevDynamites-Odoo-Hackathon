// API Client for PostgreSQL backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
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

export interface ApprovalRule {
  id: string;
  company_id: string;
  rule_type: 'percentage' | 'specific_approver' | 'hybrid';
  percentage_threshold?: number;
  specific_approver_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface AuthResponse {
  user: User;
  token: string;
  role: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  // File upload method
  async uploadFile(file: File, endpoint: string = '/upload'): Promise<ApiResponse<any>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers, // Don't set Content-Type when sending FormData
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'File upload failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error occurred during file upload' };
    }
  }

  // Authentication methods
  async signUp(
    email: string,
    password: string,
    fullName: string,
    companyName: string,
    country: string,
    currency: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        fullName,
        companyName,
        country,
        currency,
      }),
    });
  }

  async signIn(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async signOut(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<ApiResponse<User & { role: string }>> {
    return this.request<User & { role: string }>('/auth/me');
  }

  // User management methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  async createUser(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'manager' | 'employee'
  ): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
  }

  // Expense methods
  async getExpenses(): Promise<ApiResponse<Expense[]>> {
    return this.request<Expense[]>('/expenses');
  }

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Expense>> {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpenseStatus(
    expenseId: string,
    status: 'approved' | 'rejected',
    comments?: string
  ): Promise<ApiResponse<Expense>> {
    return this.request<Expense>(`/expenses/${expenseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }

  async getPendingExpenses(): Promise<ApiResponse<Expense[]>> {
    return this.request<Expense[]>('/expenses/pending');
  }

  // Company methods
  async getCompany(): Promise<ApiResponse<Company>> {
    return this.request<Company>('/company');
  }

  async updateCompany(company: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request<Company>('/company', {
      method: 'PATCH',
      body: JSON.stringify(company),
    });
  }

  // Category methods
  async getCategories(): Promise<ApiResponse<ExpenseCategory[]>> {
    return this.request<ExpenseCategory[]>('/categories');
  }

  async createCategory(name: string): Promise<ApiResponse<ExpenseCategory>> {
    return this.request<ExpenseCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Manager relationship methods
  async getManagerRelationships(): Promise<ApiResponse<ManagerRelationship[]>> {
    return this.request<ManagerRelationship[]>('/manager-relationships');
  }

  async createManagerRelationship(
    employeeId: string,
    managerId: string
  ): Promise<ApiResponse<ManagerRelationship>> {
    return this.request<ManagerRelationship>('/manager-relationships', {
      method: 'POST',
      body: JSON.stringify({ employeeId, managerId }),
    });
  }

  async deleteManagerRelationship(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/manager-relationships/${id}`, {
      method: 'DELETE',
    });
  }

  // Approval chain methods
  async getApprovalChains(): Promise<ApiResponse<ApprovalChain[]>> {
    return this.request<ApprovalChain[]>('/approval-chains');
  }

  async createApprovalChain(
    approverRole: 'admin' | 'manager' | 'employee',
    sequenceOrder: number
  ): Promise<ApiResponse<ApprovalChain>> {
    return this.request<ApprovalChain>('/approval-chains', {
      method: 'POST',
      body: JSON.stringify({ approverRole, sequenceOrder }),
    });
  }

  async deleteApprovalChain(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/approval-chains/${id}`, {
      method: 'DELETE',
    });
  }

  // Approval rules methods
  async getApprovalRules(): Promise<ApiResponse<ApprovalRule[]>> {
    return this.request<ApprovalRule[]>('/approval-rules');
  }

  async createApprovalRule(
    ruleType: 'percentage' | 'specific_approver' | 'hybrid',
    percentageThreshold?: number,
    specificApproverId?: string,
    description?: string
  ): Promise<ApiResponse<ApprovalRule>> {
    return this.request<ApprovalRule>('/approval-rules', {
      method: 'POST',
      body: JSON.stringify({ 
        ruleType, 
        percentageThreshold, 
        specificApproverId, 
        description 
      }),
    });
  }

  async updateApprovalRule(
    id: string,
    ruleType: 'percentage' | 'specific_approver' | 'hybrid',
    percentageThreshold?: number,
    specificApproverId?: string,
    description?: string,
    isActive?: boolean
  ): Promise<ApiResponse<ApprovalRule>> {
    return this.request<ApprovalRule>(`/approval-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        ruleType, 
        percentageThreshold, 
        specificApproverId, 
        description,
        isActive
      }),
    });
  }

  async deleteApprovalRule(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/approval-rules/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense approval methods
  async getExpenseApprovals(expenseId: string): Promise<ApiResponse<ExpenseApproval[]>> {
    return this.request<ExpenseApproval[]>(`/expense-approvals/${expenseId}`);
  }

  async updateExpenseApproval(
    approvalId: string,
    status: 'approved' | 'rejected',
    comments?: string
  ): Promise<ApiResponse<ExpenseApproval>> {
    return this.request<ExpenseApproval>(`/expense-approvals/${approvalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }

  // Expense approval rules methods
  async getExpenseApprovalRules(expenseId: string): Promise<ApiResponse<ApprovalRule[]>> {
    return this.request<ApprovalRule[]>(`/expense-approval-rules/${expenseId}`);
  }

  async linkExpenseWithApprovalRule(
    expenseId: string,
    approvalRuleId: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>('/expense-approval-rules', {
      method: 'POST',
      body: JSON.stringify({ expenseId, approvalRuleId }),
    });
  }

  // Pending expenses for approver
  async getPendingExpensesForApprover(): Promise<ApiResponse<Expense[]>> {
    return this.request<Expense[]>('/expenses/pending-for-approver');
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();