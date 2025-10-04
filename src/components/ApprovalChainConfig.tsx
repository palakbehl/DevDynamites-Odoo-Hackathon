import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUpDown, Workflow, Percent, UserCheck } from "lucide-react";

interface ApprovalChain {
  id: string;
  company_id: string;
  approver_role: 'admin' | 'manager' | 'employee';
  sequence_order: number;
  created_at: string;
}

interface ApprovalRule {
  id: string;
  company_id: string;
  rule_type: 'percentage' | 'specific_approver' | 'hybrid';
  percentage_threshold?: number;
  specific_approver_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ApprovalChainConfig = () => {
  const [approvalChains, setApprovalChains] = useState<ApprovalChain[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [newChain, setNewChain] = useState({
    approverRole: "manager" as "admin" | "manager" | "employee",
    sequenceOrder: 1
  });
  const [newRule, setNewRule] = useState({
    ruleType: "percentage" as "percentage" | "specific_approver" | "hybrid",
    percentageThreshold: 60,
    specificApproverId: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovalChains();
    fetchApprovalRules();
  }, []);

  const fetchApprovalChains = async () => {
    try {
      const response = await apiClient.getApprovalChains();
      if (response.data) {
        // Sort by sequence order
        const sortedChains = response.data.sort((a, b) => a.sequence_order - b.sequence_order);
        setApprovalChains(sortedChains);
      }
    } catch (error) {
      console.error("Error fetching approval chains:", error);
    }
  };

  const fetchApprovalRules = async () => {
    try {
      const response = await apiClient.getApprovalRules();
      if (response.data) {
        setApprovalRules(response.data);
      }
    } catch (error) {
      console.error("Error fetching approval rules:", error);
    }
  };

  const handleAddChain = async () => {
    setLoading(true);
    try {
      const response = await apiClient.createApprovalChain(
        newChain.approverRole,
        newChain.sequenceOrder
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Approval chain added successfully",
      });

      setNewChain({ approverRole: "manager", sequenceOrder: approvalChains.length + 1 });
      fetchApprovalChains();
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

  const handleAddRule = async () => {
    setLoading(true);
    try {
      const response = await apiClient.createApprovalRule(
        newRule.ruleType,
        newRule.percentageThreshold,
        newRule.specificApproverId || undefined,
        newRule.description
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Approval rule added successfully",
      });

      setNewRule({
        ruleType: "percentage",
        percentageThreshold: 60,
        specificApproverId: "",
        description: ""
      });
      fetchApprovalRules();
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

  const handleDeleteChain = async (chainId: string) => {
    setLoading(true);
    try {
      // For now, we'll just remove it from the UI
      // In a real implementation, you would call an API endpoint to delete the chain
      setApprovalChains(approvalChains.filter(chain => chain.id !== chainId));
      
      toast({
        title: "Success",
        description: "Approval chain removed",
      });
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

  const handleDeleteRule = async (ruleId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.deleteApprovalRule(ruleId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Approval rule removed",
      });

      setApprovalRules(approvalRules.filter(rule => rule.id !== ruleId));
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

  const moveChainUp = (index: number) => {
    if (index === 0) return;
    
    const newChains = [...approvalChains];
    [newChains[index - 1], newChains[index]] = [newChains[index], newChains[index - 1]];
    
    // Update sequence orders
    newChains.forEach((chain, i) => {
      chain.sequence_order = i + 1;
    });
    
    setApprovalChains(newChains);
  };

  const moveChainDown = (index: number) => {
    if (index === approvalChains.length - 1) return;
    
    const newChains = [...approvalChains];
    [newChains[index + 1], newChains[index]] = [newChains[index], newChains[index + 1]];
    
    // Update sequence orders
    newChains.forEach((chain, i) => {
      chain.sequence_order = i + 1;
    });
    
    setApprovalChains(newChains);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Approval Configuration</h2>
        <p className="text-muted-foreground">Define approval chains and conditional rules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="mr-2 h-5 w-5" />
            Approval Chain Configuration
          </CardTitle>
          <CardDescription>Define the sequence of approvers for expense claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-2">
              <Label>Approver Role</Label>
              <Select 
                value={newChain.approverRole} 
                onValueChange={(value: any) => setNewChain({...newChain, approverRole: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sequence Order</Label>
              <Input
                type="number"
                min="1"
                value={newChain.sequenceOrder}
                onChange={(e) => setNewChain({...newChain, sequenceOrder: parseInt(e.target.value) || 1})}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddChain} 
                disabled={loading}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </div>

          {approvalChains.length === 0 ? (
            <div className="text-center py-8">
              <ArrowUpDown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No approval chain configured</h3>
              <p className="mt-2 text-muted-foreground">
                Add your first approval step above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvalChains.map((chain, index) => (
                <div 
                  key={chain.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{chain.sequence_order}</span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">{chain.approver_role}</p>
                      <p className="text-sm text-muted-foreground">
                        Step {chain.sequence_order} in approval chain
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveChainUp(index)}
                      disabled={index === 0 || loading}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveChainDown(index)}
                      disabled={index === approvalChains.length - 1 || loading}
                    >
                      <ArrowUpDown className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteChain(chain.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Conditional Approval Rules
          </CardTitle>
          <CardDescription>Configure special approval rules for specific scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Select 
                value={newRule.ruleType} 
                onValueChange={(value: any) => setNewRule({...newRule, ruleType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="specific_approver">Specific Approver</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRule.ruleType === "percentage" && (
              <div className="space-y-2">
                <Label>Percentage Threshold (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newRule.percentageThreshold}
                  onChange={(e) => setNewRule({...newRule, percentageThreshold: parseInt(e.target.value) || 60})}
                />
              </div>
            )}

            {newRule.ruleType === "specific_approver" && (
              <div className="space-y-2">
                <Label>Specific Approver</Label>
                <Input
                  placeholder="Approver ID"
                  value={newRule.specificApproverId}
                  onChange={(e) => setNewRule({...newRule, specificApproverId: e.target.value})}
                />
              </div>
            )}

            {newRule.ruleType === "hybrid" && (
              <>
                <div className="space-y-2">
                  <Label>Percentage Threshold (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newRule.percentageThreshold}
                    onChange={(e) => setNewRule({...newRule, percentageThreshold: parseInt(e.target.value) || 60})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specific Approver (Optional)</Label>
                  <Input
                    placeholder="Approver ID"
                    value={newRule.specificApproverId}
                    onChange={(e) => setNewRule({...newRule, specificApproverId: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Rule description"
                value={newRule.description}
                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddRule} 
                disabled={loading}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </div>

          {approvalRules.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No conditional rules configured</h3>
              <p className="mt-2 text-muted-foreground">
                Add your first conditional approval rule above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvalRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Percent className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{rule.rule_type.replace('_', ' ')} Rule</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || "No description"}
                      </p>
                      {rule.rule_type === "percentage" && (
                        <p className="text-xs text-muted-foreground">
                          Threshold: {rule.percentage_threshold}%
                        </p>
                      )}
                      {rule.rule_type === "specific_approver" && rule.specific_approver_id && (
                        <p className="text-xs text-muted-foreground">
                          Approver ID: {rule.specific_approver_id}
                        </p>
                      )}
                      {rule.rule_type === "hybrid" && (
                        <p className="text-xs text-muted-foreground">
                          {rule.percentage_threshold}% OR specific approver
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default ApprovalChainConfig;