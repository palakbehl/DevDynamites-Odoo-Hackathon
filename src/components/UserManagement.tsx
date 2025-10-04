import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, GitBranch, Download } from "lucide-react";
import ManagerRelationships from "@/components/ManagerRelationships";

// User interface that matches the backend response
interface User {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  role?: string;
}

const UserManagement = ({ user }: { user: any }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManagerRelationships, setShowManagerRelationships] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "employee" as "admin" | "manager" | "employee",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.createUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "User added successfully",
      });

      setFormData({ email: "", fullName: "", password: "", role: "employee" });
      setShowAddForm(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Full Name', 'Email', 'Role', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          `"${user.full_name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${user.created_at || ''}"`
        ].join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "User data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export user data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage employees and assign roles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportUsers} variant="outline" disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowManagerRelationships(!showManagerRelationships)}
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Manager Relationships
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new employee or manager account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add User"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showManagerRelationships && (
        <ManagerRelationships />
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Current Users
            </div>
          </CardTitle>
          <CardDescription>All users in your organization</CardDescription>
        </CardHeader>
        <CardContent>
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
                <Badge variant="secondary" className="capitalize">
                  {user.role || "No role"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;