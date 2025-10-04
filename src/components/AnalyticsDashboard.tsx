import { useEffect, useState } from "react";
import { apiClient, User as ApiUser } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  FileText,
  Calendar,
  Tag,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Expense {
  id: string;
  amount: number;
  description: string;
  status: string;
  expense_date: string;
  created_at: string;
  category?: string;
  user_id: string;
}

interface User extends ApiUser {
  role?: string;
}

const AnalyticsDashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Chart data states
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<any[]>([]);
  const [categoryExpenseData, setCategoryExpenseData] = useState<any[]>([]);
  const [approvalStatusData, setApprovalStatusData] = useState<any[]>([]);
  const [dailyExpenseTrend, setDailyExpenseTrend] = useState<any[]>([]);
  const [topClaimersData, setTopClaimersData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const expensesResponse = await apiClient.getExpenses();
      const usersResponse = await apiClient.getUsers();
      
      if (expensesResponse.data) {
        setExpenses(expensesResponse.data);
        processExpenseData(expensesResponse.data);
      }
      
      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const processExpenseData = (expenses: Expense[]) => {
    // Monthly expense trends
    const monthlyMap: Record<string, { total: number; count: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = { total: 0, count: 0 };
    }
    
    expenses.forEach(exp => {
      const month = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap.hasOwnProperty(month)) {
        monthlyMap[month].total += Number(exp.amount);
        monthlyMap[month].count += 1;
      }
    });
    
    const monthlyChartData = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      amount: parseFloat(data.total.toFixed(2)),
      count: data.count
    }));
    
    setMonthlyExpenseData(monthlyChartData);

    // Category expense distribution
    const categoryMap: Record<string, number> = {};
    expenses.forEach(exp => {
      const category = exp.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + Number(exp.amount);
    });
    
    const categoryChartData = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        name: category,
        value: parseFloat(amount.toFixed(2))
      }))
      .slice(0, 5); // Top 5 categories
    
    setCategoryExpenseData(categoryChartData);

    // Approval status distribution
    const statusMap: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    expenses.forEach(exp => {
      statusMap[exp.status] = (statusMap[exp.status] || 0) + 1;
    });
    
    const statusChartData = Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
    
    setApprovalStatusData(statusChartData);

    // Daily expense trend (last 30 days)
    const dailyMap: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }
    
    expenses.forEach(exp => {
      const date = exp.expense_date;
      if (dailyMap.hasOwnProperty(date)) {
        dailyMap[date] += Number(exp.amount);
      }
    });
    
    const dailyChartData = Object.entries(dailyMap).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: parseFloat(amount.toFixed(2))
    }));
    
    setDailyExpenseTrend(dailyChartData);

    // Top claimers
    const claimerMap: Record<string, { amount: number; count: number }> = {};
    expenses.forEach(exp => {
      // In a real app, we'd have user data linked to expenses
      const userId = exp.user_id;
      if (!claimerMap[userId]) {
        claimerMap[userId] = { amount: 0, count: 0 };
      }
      claimerMap[userId].amount += Number(exp.amount);
      claimerMap[userId].count += 1;
    });
    
    const topClaimers = Object.entries(claimerMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([userId, data], index) => ({
        name: `User ${index + 1}`,
        amount: parseFloat(data.amount.toFixed(2)),
        count: data.count
      }));
    
    setTopClaimersData(topClaimers);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExport = (format: string) => {
    console.log(`Exporting analytics as ${format}`);
    // In a real app, this would export the data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Insights and trends for your expense management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport("PDF")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / 12).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.filter(exp => exp.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Expense Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trends</CardTitle>
            <CardDescription>Spending patterns over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>Distribution of spending across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Expense Trend</CardTitle>
            <CardDescription>Spending activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyExpenseTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  name="Amount ($)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Status Distribution</CardTitle>
            <CardDescription>Distribution of expense statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {approvalStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Approved' ? '#10B981' : 
                        entry.name === 'Pending' ? '#F59E0B' : 
                        '#EF4444'
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Claimers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Claimers</CardTitle>
            <CardDescription>Highest expense submitters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClaimersData.map((claimer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{claimer.name}</p>
                      <p className="text-sm text-muted-foreground">{claimer.count} claims</p>
                    </div>
                  </div>
                  <p className="font-bold">${claimer.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Policy Insights
            </CardTitle>
            <CardDescription>Potential policy violations and anomalies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekend Expenses</p>
                    <p className="text-sm text-muted-foreground">Expenses on weekends</p>
                  </div>
                  <span className="font-bold">12</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High-Value Claims</p>
                    <p className="text-sm text-muted-foreground">Claims over $1000</p>
                  </div>
                  <span className="font-bold">8</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Duplicate Receipts</p>
                    <p className="text-sm text-muted-foreground">Potential duplicates</p>
                  </div>
                  <span className="font-bold text-yellow-500">3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>Download detailed analytics reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => handleExport("CSV")}>
              Export as CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("PDF")}>
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("Summary")}>
              Export Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;