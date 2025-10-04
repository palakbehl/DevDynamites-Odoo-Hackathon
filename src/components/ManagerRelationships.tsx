import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, UserPlus, Users, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface ManagerRelationship {
  id: string;
  employee_id: string;
  manager_id: string;
  employee_name?: string;
  manager_name?: string;
}

const ManagerRelationships = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [relationships, setRelationships] = useState<ManagerRelationship[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchManagerRelationships();
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

  const fetchManagerRelationships = async () => {
    try {
      const response = await apiClient.getManagerRelationships();
      if (response.data) {
        // Enrich relationships with user names
        const enrichedRelationships = response.data.map((rel: any) => ({
          ...rel,
          employee_name: users.find(u => u.id === rel.employee_id)?.full_name || "Unknown Employee",
          manager_name: users.find(u => u.id === rel.manager_id)?.full_name || "Unknown Manager"
        }));
        setRelationships(enrichedRelationships);
      }
    } catch (error) {
      console.error("Error fetching manager relationships:", error);
    }
  };

  const handleCreateRelationship = async () => {
    if (!selectedEmployee || !selectedManager) {
      toast({
        title: "Error",
        description: "Please select both employee and manager",
        variant: "destructive",
      });
      return;
    }

    if (selectedEmployee === selectedManager) {
      toast({
        title: "Error",
        description: "Employee and manager cannot be the same person",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.createManagerRelationship(selectedEmployee, selectedManager);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Manager relationship created successfully",
      });

      setSelectedEmployee("");
      setSelectedManager("");
      fetchManagerRelationships();
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

  const handleDeleteRelationship = async (relationshipId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.deleteManagerRelationship(relationshipId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Manager relationship removed",
      });
      
      fetchManagerRelationships();
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

  // Filter users to show only employees and managers
  const employeeUsers = users.filter(user => user.role === "employee");
  const managerUsers = users.filter(user => user.role === "manager" || user.role === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Manager Relationships</h2>
        <p className="text-muted-foreground">Define reporting relationships between employees and managers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Create New Relationship
          </CardTitle>
          <CardDescription>Assign a manager to an employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Manager</label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {managerUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleCreateRelationship} 
                disabled={loading || !selectedEmployee || !selectedManager}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Relationship"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Current Relationships
          </CardTitle>
          <CardDescription>All manager-employee relationships in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {relationships.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No relationships found</h3>
              <p className="mt-2 text-muted-foreground">
                Create your first manager-employee relationship above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {relationships.map((relationship) => (
                <div 
                  key={relationship.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{relationship.employee_name}</p>
                        <p className="text-sm text-muted-foreground">Employee</p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{relationship.manager_name}</p>
                        <p className="text-sm text-muted-foreground">Manager</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRelationship(relationship.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerRelationships;