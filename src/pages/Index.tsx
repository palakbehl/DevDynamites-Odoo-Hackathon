import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, DollarSign, Users, Shield, Zap, Brain } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import NotificationSystem from "@/components/NotificationSystem";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold">SmartExpense</h1>
        </div>
        <div className="flex gap-3 items-center">
          <LanguageSelector />
          <NotificationSystem />
          <Button variant="outline" onClick={() => navigate("/auth?mode=signin")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/auth?mode=signup")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Expense Management
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            SmartExpense
            <span className="block text-primary mt-2">AI-Powered Expense Management</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline your expense approvals with multi-level workflows, currency conversion, and powerful analytics
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=signin")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Multi-Level Approval</h3>
            <p className="text-muted-foreground">
              Configure sequential approval workflows with managers and admins
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Currency Conversion</h3>
            <p className="text-muted-foreground">
              Automatic conversion to company currency using real-time exchange rates
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Admin, manager, and employee dashboards with tailored permissions
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Fraud Detection</h3>
            <p className="text-muted-foreground">
              Detect duplicate receipts and suspicious claims with machine learning
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Compliant</h3>
            <p className="text-muted-foreground">
              Audit trails and policy enforcement for complete compliance
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Insights and forecasting for smarter financial decisions
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Transform Your Expense Management Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of companies streamlining their expense processes with SmartExpense
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;