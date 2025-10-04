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
  User,
  Info
} from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ExpenseSubmission from "@/components/ExpenseSubmission";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import FraudDetection from "@/components/FraudDetection";
import ChatbotAssistant from "@/components/ChatbotAssistant";
// Removed LanguageSelector and NotificationSystem imports
import AuditTrail from "@/components/AuditTrail";
import ManagerRelationships from "@/components/ManagerRelationships";
import ApprovalChainConfig from "@/components/ApprovalChainConfig";
import { Badge } from "@/components/ui/badge";
import EmployeeExpenses from "@/components/EmployeeExpenses";
import ManagerApprovals from "@/components/ManagerApprovals";
import AdminApprovals from "@/components/AdminApprovals";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <p className="text-lg text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                SmartExpense
              </h1>
              <p className="text-sm text-gray-400 capitalize">
                {userRole} Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Removed LanguageSelector and NotificationSystem */}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-green-600 text-green-400 hover:bg-green-600/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 bg-gray-800/50">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {userRole === "employee" && (
              <TabsTrigger 
                value="submit" 
                className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Submit Expense</span>
              </TabsTrigger>
            )}
            {(userRole === "manager" || userRole === "admin") && (
              <TabsTrigger 
                value="approvals" 
                className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
            )}
            {userRole === "employee" && (
              <TabsTrigger 
                value="my-expenses" 
                className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
              >
                <Receipt className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">My Expenses</span>
              </TabsTrigger>
            )}
            {userRole === "admin" && (
              <>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger 
              value="settings" 
              className="flex items-center justify-center data-[state=active]:bg-green-700 data-[state=active]:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {userRole === "admin" && <AdminDashboard user={user} />}
            {userRole === "manager" && <ManagerDashboard />}
            {userRole === "employee" && <EmployeeDashboard />}
          </TabsContent>
          

          
          {(userRole === "manager" || userRole === "admin") && (
            <TabsContent value="approvals">
              {userRole === "admin" ? (
                <AdminApprovals user={user} />
              ) : (
                <ManagerApprovals user={user} />
              )}
            </TabsContent>
          )}
          
          {userRole === "employee" && (
            <TabsContent value="my-expenses">
              <EmployeeExpenses />
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
            </>
          )}
          
          <TabsContent value="settings">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white">System Settings</h2>
                <p className="text-gray-400">Configure company policies and system settings</p>
              </div>
              
              <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                  <TabsTrigger 
                    value="company" 
                    className="data-[state=active]:bg-green-700 data-[state=active]:text-white"
                  >
                    Company Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approval" 
                    className="data-[state=active]:bg-green-700 data-[state=active]:text-white"
                  >
                    Approval Settings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="policies" 
                    className="data-[state=active]:bg-green-700 data-[state=active]:text-white"
                  >
                    Policies
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="company">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-white">Company Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={companyInfo.name}
                          onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                        <input
                          type="text"
                          value={companyInfo.country}
                          onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
                        <input
                          type="text"
                          value={companyInfo.default_currency}
                          onChange={(e) => setCompanyInfo({...companyInfo, default_currency: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button 
                        onClick={handleSaveSettings}
                        className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="approval">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-white">Approval Workflow</h3>
                    <ApprovalChainConfig />
                  </div>
                </TabsContent>
                
                <TabsContent value="policies">
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-white">Company Policies</h3>
                    <ManagerRelationships />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;