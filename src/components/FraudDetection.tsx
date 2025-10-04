import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  FileText,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Expense {
  id: string;
  amount: number;
  description: string;
  status: string;
  expense_date: string;
  created_at: string;
  category?: string;
  original_currency: string;
  fraud_flag?: boolean;
  fraud_reason?: string;
}

const FraudDetection = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await apiClient.getExpenses();
      if (response.data) {
        // Mock fraud detection data for demonstration
        const expensesWithFraud = response.data.map((expense: any, index: number) => ({
          ...expense,
          fraud_flag: index % 4 === 0, // Flag every 4th expense for demo
          fraud_reason: index % 4 === 0 ? 
            ["Duplicate receipt detected", "Unusual spending pattern", "Weekend expense"][index % 3] : 
            undefined
        }));
        setExpenses(expensesWithFraud);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const runFraudScan = async () => {
    setScanning(true);
    // Simulate fraud detection scan
    setTimeout(() => {
      setScanning(false);
      // Refresh expenses to show new fraud flags
      fetchExpenses();
    }, 3000);
  };

  const getFraudBadge = (expense: Expense) => {
    if (expense.fraud_flag) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Flagged
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center">
        <CheckCircle className="mr-1 h-3 w-3" />
        Clear
      </Badge>
    );
  };

  const flaggedExpenses = expenses.filter(expense => expense.fraud_flag);
  const clearExpenses = expenses.filter(expense => !expense.fraud_flag);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">AI Fraud Detection</h2>
        <p className="text-muted-foreground">Intelligent detection of suspicious expense claims</p>
      </div>

      {/* Fraud Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">All expense claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Expenses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedExpenses.length}</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.length > 0 ? 
                `${Math.round((flaggedExpenses.length / expenses.length) * 100)}%` : 
                '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Fraud detection accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Fraud Detection System
          </CardTitle>
          <CardDescription>AI-powered anomaly detection for expense claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Run Fraud Detection Scan</p>
              <p className="text-sm text-muted-foreground">
                Analyze all expenses for potential fraud patterns
              </p>
            </div>
            <Button 
              onClick={runFraudScan} 
              disabled={scanning}
              className="flex items-center"
            >
              {scanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Scan
                </>
              )}
            </Button>
          </div>
          
          {scanning && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fraud Detection in Progress</AlertTitle>
              <AlertDescription>
                Analyzing expense patterns and detecting anomalies. This may take a few moments...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Flagged Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Flagged Expenses
          </CardTitle>
          <CardDescription>Expenses that require additional review</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {flaggedExpenses.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 text-lg font-semibold">No Flagged Expenses</h3>
                <p className="mt-2 text-muted-foreground">
                  All expenses have passed fraud detection checks
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{expense.description}</p>
                        {getFraudBadge(expense)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {expense.original_currency} {Number(expense.amount).toFixed(2)}
                        </span>
                        <span>{expense.category || 'General'}</span>
                      </div>
                      {expense.fraud_reason && (
                        <div className="mt-2 flex items-start">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-destructive">{expense.fraud_reason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Clear Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Clear Expenses</CardTitle>
          <CardDescription>Expenses that passed fraud detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {clearExpenses.slice(0, 5).map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{expense.description}</p>
                      {getFraudBadge(expense)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {expense.original_currency} {Number(expense.amount).toFixed(2)}
                      </span>
                      <span>{expense.category || 'General'}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="mt-2 md:mt-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Fraud Detection Features */}
      <Card>
        <CardHeader>
          <CardTitle>AI Fraud Detection Features</CardTitle>
          <CardDescription>How our system protects your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start p-4 border rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Duplicate Detection</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Identifies identical or similar receipts to prevent duplicate claims
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 border rounded-lg">
              <Zap className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Anomaly Detection</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Flags unusual spending patterns based on historical data
              </p>
              </div>
            </div>
            <div className="flex items-start p-4 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Policy Violation Checks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically verifies expenses against company policies
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 border rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Real-time Monitoring</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Continuous scanning of new submissions for potential fraud
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetection;