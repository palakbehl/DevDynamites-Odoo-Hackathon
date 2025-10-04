import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Expense {
  id: string;
  amount: number;
  description: string;
  status: string;
  expense_date: string;
  created_at: string;
  category?: string;
}

const EmployeeDashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await apiClient.getExpenses();
      if (response.data) {
        setExpenses(response.data);
        const total = response.data.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const pending = response.data.filter((exp) => exp.status === "pending").length;
        const approved = response.data.filter((exp) => exp.status === "approved").length;
        const rejected = response.data.filter((exp) => exp.status === "rejected").length;

        setStats({ total, pending, approved, rejected });
        
        // Prepare monthly data for the last 6 months
        const monthlyMap: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyMap[monthKey] = 0;
        }
        
        response.data.forEach(exp => {
          const month = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (monthlyMap.hasOwnProperty(month)) {
            monthlyMap[month] = (monthlyMap[month] || 0) + Number(exp.amount);
          }
        });
        
        const monthlyChartData = Object.entries(monthlyMap).map(([month, amount]) => ({
          month,
          amount: parseFloat(amount.toFixed(2))
        }));
        
        setMonthlyData(monthlyChartData);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Expenses</h2>
        <p className="text-muted-foreground">Track and manage your expense submissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Claims rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trends</CardTitle>
            <CardDescription>Your spending patterns over time</CardDescription>
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
            <CardTitle>Expense Summary</CardTitle>
            <CardDescription>Your expense statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Approval Rate</p>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">78%</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Avg. Processing Time</p>
                    <p className="text-sm text-muted-foreground">Approval duration</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">3.2 days</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Avg. Claim Amount</p>
                    <p className="text-sm text-muted-foreground">Per submission</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">${(stats.total / Math.max(expenses.length, 1)).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest expense submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expenses submitted yet. Click "Submit Expense" to add your first one.
            </p>
          ) : (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.expense_date).toLocaleDateString()} • {expense.category || 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">${Number(expense.amount).toFixed(2)}</p>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;