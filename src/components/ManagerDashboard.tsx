import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, CheckCircle, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Expense {
  id: string;
  amount: number;
  description: string;
  status: string;
  expense_date: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    teamExpenses: 0,
    pendingApprovals: 0,
    approvedCount: 0,
    teamMembers: 0,
  });

  const [teamExpenses, setTeamExpenses] = useState<Expense[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTeamExpenses();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.getExpenses();
      if (response.data) {
        const expenses = response.data;
        const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const pending = expenses.filter((exp) => exp.status === "pending").length;
        const approved = expenses.filter((exp) => exp.status === "approved").length;

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

        setStats({
          teamExpenses: total,
          pendingApprovals: pending,
          approvedCount: approved,
          teamMembers: 5, // Placeholder, would need to fetch actual team members
        });
        
        setMonthlyData(monthlyChartData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTeamExpenses = async () => {
    try {
      const response = await apiClient.getExpenses();
      if (response.data) {
        // Filter to show only pending expenses for manager approval
        const pendingExpenses = response.data
          .filter((exp) => exp.status === "pending")
          .slice(0, 5); // Get latest 5 pending expenses
        setTeamExpenses(pendingExpenses);
      }
    } catch (error) {
      console.error("Error fetching team expenses:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Manager Dashboard</h2>
        <p className="text-muted-foreground">Your team's expense analytics and approvals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.teamExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total team spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCount}</div>
            <p className="text-xs text-muted-foreground">Completed approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trends</CardTitle>
            <CardDescription>Your team's spending patterns</CardDescription>
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
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Expenses awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {teamExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No pending expenses require your approval at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.user?.full_name || 'Team Member'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold">${Number(expense.amount).toFixed(2)}</p>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Expense submission and approval metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">2.3 days</p>
              <p className="text-sm text-muted-foreground">Avg. Approval Time</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">$12,450</p>
              <p className="text-sm text-muted-foreground">Monthly Spend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;