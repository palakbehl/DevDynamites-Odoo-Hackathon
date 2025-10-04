import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock, AlertTriangle, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Expense {
  id: string;
  amount: number;
  description: string;
  status: string;
  expense_date: string;
  created_at: string;
  category?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalUsers: 0,
    flaggedExpenses: 0,
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchExpenses();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const expensesResponse = await apiClient.getExpenses();
      const usersResponse = await apiClient.getUsers();

      if (expensesResponse.data) {
        const expenses = expensesResponse.data;
        const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const pending = expenses.filter((exp) => exp.status === "pending").length;
        const approved = expenses.filter((exp) => exp.status === "approved").length;
        const rejected = expenses.filter((exp) => exp.status === "rejected").length;
        // For now, we'll set flagged to 0, will implement fraud detection later
        const flagged = 0;

        // Prepare monthly data
        const monthlyMap: Record<string, number> = {};
        expenses.forEach(exp => {
          const month = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyMap[month] = (monthlyMap[month] || 0) + Number(exp.amount);
        });
        
        const monthlyChartData = Object.entries(monthlyMap).map(([month, amount]) => ({
          month,
          amount: parseFloat(amount.toFixed(2))
        }));

        // Prepare category data
        const categoryMap: Record<string, number> = {};
        expenses.forEach(exp => {
          const category = exp.category || 'Other';
          categoryMap[category] = (categoryMap[category] || 0) + Number(exp.amount);
        });
        
        const categoryChartData = Object.entries(categoryMap).map(([category, amount]) => ({
          name: category,
          value: parseFloat(amount.toFixed(2))
        }));

        setStats({
          totalExpenses: total,
          pendingExpenses: pending,
          approvedExpenses: approved,
          rejectedExpenses: rejected,
          flaggedExpenses: flagged,
          totalUsers: usersResponse.data?.length || 0,
        });
        
        setMonthlyData(monthlyChartData);
        setCategoryData(categoryChartData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await apiClient.getExpenses();
      if (response.data) {
        setExpenses(response.data.slice(0, 5)); // Get latest 5 expenses
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers();
      if (response.data) {
        setUsers(response.data.slice(0, 5)); // Get latest 5 users
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">Complete expense management analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Company-wide spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedExpenses}</div>
            <p className="text-xs text-muted-foreground">Completed approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedExpenses}</div>
            <p className="text-xs text-muted-foreground">Claims rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trends</CardTitle>
            <CardDescription>Spending patterns over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>Distribution of spending</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest expense submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses submitted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold">${Number(expense.amount).toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>New team members</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found.
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;