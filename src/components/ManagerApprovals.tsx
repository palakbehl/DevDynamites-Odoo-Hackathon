import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Users, Clock, AlertCircle, User, UserCheck, Workflow } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  status: string;
  user_id: string;
  full_name?: string;
  category?: string;
  original_currency: string;
  approver_sequence?: string[];
  current_approver?: string;
}

interface ExpenseApproval {
  id: string;
  expense_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  sequence_order: number;
  created_at: string;
  updated_at: string;
  approver_name?: string;
  approver_role?: string;
}

const ManagerApprovals = ({ user }: { user: any }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [approvals, setApprovals] = useState<Record<string, ExpenseApproval[]>>({});
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      const response = await apiClient.getPendingExpensesForApprover();
      if (response.data) {
        // Extract expenses from the updated API response
        const expensesData = response.data.map((expense: any) => ({
          id: expense._id || expense.id,
          amount: expense.amount,
          description: expense.description,
          expense_date: expense.expense_date,
          status: expense.status,
          user_id: expense.user_id,
          full_name: expense.full_name || "Unknown User",
          category: expense.category || "General",
          original_currency: expense.original_currency,
          approver_sequence: expense.approval_sequence,
          current_approver: expense.approval_status,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          approval_id: expense.approval_id
        }));

        setExpenses(expensesData);
        
        // Fetch approvals for each expense
        const approvalPromises = expensesData.map(async (expense: any) => {
          const approvalsResponse = await apiClient.getExpenseApprovals(expense.id);
          return { expenseId: expense.id, approvals: approvalsResponse.data || [] };
        });
        
        const approvalResults = await Promise.all(approvalPromises);
        
        const newApprovals: Record<string, ExpenseApproval[]> = {};
        approvalResults.forEach(({ expenseId, approvals }) => {
          newApprovals[expenseId] = approvals;
        });
        
        setApprovals(newApprovals);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending expenses",
        variant: "destructive",
      });
    }
  };

  const handleApproval = async (expenseId: string, approvalId: string, status: "approved" | "rejected") => {
    setLoading(true);
    try {
      // If we don't have a specific approval ID, try to find it
      let actualApprovalId = approvalId;
      if (!actualApprovalId) {
        // Try to get it from the approvals state
        const expenseApprovals = approvals[expenseId] || [];
        const pendingApproval = expenseApprovals.find(approval => approval.status === 'pending');
        if (pendingApproval) {
          actualApprovalId = pendingApproval.id;
        }
      }
      
      if (!actualApprovalId) {
        throw new Error("Unable to find approval record");
      }
      
      const response = await apiClient.updateExpenseApproval(actualApprovalId, status, comments);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Expense ${status} successfully`,
      });

      setComments("");
      setSelectedExpense(null);
      fetchPendingExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update approval status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getApprovalStatus = (expenseId: string) => {
    const expenseApprovals = approvals[expenseId] || [];
    
    if (expenseApprovals.length === 0) return null;
    
    return (
      <div className="mt-3">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Workflow className="mr-2 h-4 w-4" />
          Approval Sequence
        </div>
        <div className="flex flex-wrap gap-2">
          {expenseApprovals.map((approval, index) => (
            <div key={approval.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                approval.status === 'pending' 
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300" 
                  : approval.status === 'approved'
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {index + 1}
              </div>
              <div className="ml-2">
                <div className="text-xs font-medium">
                  {approval.approver_name || `Approver ${index + 1}`}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {approval.approver_role || 'Approver'}
                </div>
              </div>
              <div className="ml-2">
                {approval.status === 'pending' && (
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                )}
                {approval.status === 'approved' && (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                )}
                {approval.status === 'rejected' && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Expense Approvals</h2>
        <p className="text-muted-foreground">Review and approve expense submissions from your team</p>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
              <p className="mt-2 text-muted-foreground">
                No pending expenses require your approval at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-start justify-between">
                      <span>{expense.description}</span>
                      <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                        {expense.category || "General"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Submitted by {expense.full_name || "Unknown User"} on{" "}
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </CardDescription>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="font-medium">{expense.original_currency} {Number(expense.amount).toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <Badge variant="secondary">{expense.status}</Badge>
                    </div>
                    {getApprovalStatus(expense.id)}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {expense.original_currency} {Number(expense.amount).toFixed(2)}
                    </p>
                    <div className="mt-2 flex items-center justify-end">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 border-t pt-4">
                {selectedExpense === expense.id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comments</label>
                    <Textarea
                      placeholder="Add comments for the next approver (optional)"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      const currentApproval = approvals[expense.id]?.find(approval => approval.status === 'pending');
                      if (currentApproval) {
                        handleApproval(expense.id, currentApproval.id, "approved");
                      }
                    }}
                    disabled={loading}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      const currentApproval = approvals[expense.id]?.find(approval => approval.status === 'pending');
                      if (currentApproval) {
                        handleApproval(expense.id, currentApproval.id, "rejected");
                      }
                    }}
                    disabled={loading}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  {selectedExpense !== expense.id ? (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedExpense(expense.id)}
                    >
                      Add Comments
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedExpense(null)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="outline" disabled>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Flag for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Approval Rules Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="mr-2 h-5 w-5" />
            Multi-Level Approval Rules
          </CardTitle>
          <CardDescription>How the approval workflow works in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">1</div>
                <h3 className="font-semibold">Manager Approval</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                First level approval by direct manager
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">2</div>
                <h3 className="font-semibold">Finance Review</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Second level review by finance team
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">3</div>
                <h3 className="font-semibold">Director Approval</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Final approval for high-value expenses
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <UserCheck className="mr-2 h-4 w-4" />
              Conditional Approval Rules
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Percentage Rule: If 60% of approvers approve → Expense approved</li>
              <li>• Specific Approver Rule: If CFO approves → Expense auto-approved</li>
              <li>• Hybrid Rule: Combine both (e.g., 60% OR CFO approves)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerApprovals;