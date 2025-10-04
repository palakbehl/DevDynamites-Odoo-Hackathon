import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  Plus, 
  Users, 
  Settings, 
  Receipt, 
  CheckSquare, 
  BarChart3, 
  Shield, 
  MessageCircle,
  Bell,
  FileText,
  Home,
  User
} from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ExpenseSubmission from "@/components/ExpenseSubmission";
import ApprovalWorkflow from "@/components/ApprovalWorkflow";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import FraudDetection from "@/components/FraudDetection";
import ChatbotAssistant from "@/components/ChatbotAssistant";
import LanguageSelector from "@/components/LanguageSelector";
import NotificationSystem from "@/components/NotificationSystem";
import AuditTrail from "@/components/AuditTrail";
import ManagerRelationships from "@/components/ManagerRelationships";
import ApprovalChainConfig from "@/components/ApprovalChainConfig";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    country: "",
    default_currency: "USD"
  });
  const [contactInfo, setContactInfo] = useState({
    address: "",
    phone: "",
    email: ""
  });
  const [approvalPolicies, setApprovalPolicies] = useState({
    approvalType: "Sequential",
    requiredApprovers: 2,
    autoApprovalLimit: 50
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchCompanyInfo();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await apiClient.getCurrentUser();
      if (response.error) {
        localStorage.removeItem('auth_token');
        navigate("/auth");
        return;
      }

      if (response.data) {
        setUser(response.data);
        setUserRole(response.data.role);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem('auth_token');
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await apiClient.getCompany();
      if (response.data) {
        setCompanyInfo({
          name: response.data.name,
          country: response.data.country,
          default_currency: response.data.default_currency
        });
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiClient.signOut();
      localStorage.removeItem('auth_token');
      navigate("/auth");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await apiClient.updateCompany({
        name: companyInfo.name,
        country: companyInfo.country,
        default_currency: companyInfo.default_currency
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">SmartExpense</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {userRole} Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <NotificationSystem />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {(userRole === "employee" || userRole === "manager") && (
              <TabsTrigger value="submit" className="flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Submit Expense</span>
              </TabsTrigger>
            )}
            {(userRole === "manager" || userRole === "admin") && (
              <TabsTrigger value="approvals" className="flex items-center justify-center">
                <CheckSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
            )}
            {userRole === "admin" && (
              <>
                <TabsTrigger value="users" className="flex items-center justify-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center justify-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center justify-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="fraud" className="flex items-center justify-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Fraud Detection</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center justify-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Audit Trail</span>
                </TabsTrigger>
              </>
            )}
            {userRole === "employee" && (
              <TabsTrigger value="chatbot" className="flex items-center justify-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            {userRole === "admin" && <AdminDashboard />}
            {userRole === "manager" && <ManagerDashboard />}
            {userRole === "employee" && <EmployeeDashboard />}
          </TabsContent>

          {(userRole === "employee" || userRole === "manager") && (
            <TabsContent value="submit">
              <ExpenseSubmission />
            </TabsContent>
          )}

          {(userRole === "manager" || userRole === "admin") && (
            <TabsContent value="approvals">
              <ApprovalWorkflow user={user} userRole={userRole} />
            </TabsContent>
          )}

          {userRole === "admin" && (
            <>
              <TabsContent value="users">
                <UserManagement user={user} />
              </TabsContent>
              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="settings">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold">System Settings</h2>
                    <p className="text-muted-foreground">Configure company policies and system settings</p>
                  </div>
                  
                  <Tabs defaultValue="company" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="company">Company Info</TabsTrigger>
                      <TabsTrigger value="approval">Approval Settings</TabsTrigger>
                      <TabsTrigger value="policies">Expense Policies</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="company">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Company Information</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={companyInfo.name}
                              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Default Currency</label>
                            <select 
                              className="w-full px-3 py-2 border rounded-md"
                              value={companyInfo.default_currency}
                              onChange={(e) => setCompanyInfo({...companyInfo, default_currency: e.target.value})}
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="INR">INR - Indian Rupee</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={companyInfo.country}
                              onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Contact Information</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <textarea 
                              className="w-full px-3 py-2 border rounded-md" 
                              rows={3}
                              value={contactInfo.address}
                              onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input 
                              type="tel" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={contactInfo.phone}
                              onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input 
                              type="email" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={contactInfo.email}
                              onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="approval">
                      <ApprovalChainConfig />
                    </TabsContent>
                    
                    <TabsContent value="policies">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Approval Policies</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Approval Type</label>
                            <select 
                              className="w-full px-3 py-2 border rounded-md"
                              value={approvalPolicies.approvalType}
                              onChange={(e) => setApprovalPolicies({...approvalPolicies, approvalType: e.target.value})}
                            >
                              <option value="Sequential">Sequential</option>
                              <option value="Parallel">Parallel</option>
                              <option value="Hybrid">Hybrid</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Required Approvers</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={approvalPolicies.requiredApprovers}
                              onChange={(e) => setApprovalPolicies({...approvalPolicies, requiredApprovers: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Auto-Approval Limit ($)</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 border rounded-md" 
                              value={approvalPolicies.autoApprovalLimit}
                              onChange={(e) => setApprovalPolicies({...approvalPolicies, autoApprovalLimit: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Expense Categories</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Default Categories</label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span>Travel</span>
                                <Badge variant="secondary">Active</Badge>
                              </div>
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span>Meals</span>
                                <Badge variant="secondary">Active</Badge>
                              </div>
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span>Office Supplies</span>
                                <Badge variant="secondary">Active</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Settings</Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="fraud">
                <FraudDetection />
              </TabsContent>
              <TabsContent value="audit">
                <AuditTrail />
              </TabsContent>
            </>
          )}

          {userRole === "employee" && (
            <TabsContent value="chatbot">
              <ChatbotAssistant />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;