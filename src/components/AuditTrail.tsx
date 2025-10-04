import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditEvent {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  resourceType: string;
  details?: string;
  ipAddress?: string;
}

const AuditTrail = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      user: "John Doe",
      action: "Created",
      resource: "Expense Claim #EXP-2023-001",
      resourceType: "Expense",
      details: "Submitted $42.50 for Starbucks coffee",
      ipAddress: "192.168.1.100"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      user: "Jane Smith",
      action: "Approved",
      resource: "Expense Claim #EXP-2023-001",
      resourceType: "Expense",
      details: "Approved by direct manager",
      ipAddress: "192.168.1.105"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      user: "Admin User",
      action: "Created",
      resource: "User Account - Bob Johnson",
      resourceType: "User",
      details: "Created new employee account",
      ipAddress: "192.168.1.200"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      user: "John Doe",
      action: "Updated",
      resource: "Profile Information",
      resourceType: "User",
      details: "Updated contact information",
      ipAddress: "192.168.1.100"
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      user: "Jane Smith",
      action: "Rejected",
      resource: "Expense Claim #EXP-2023-002",
      resourceType: "Expense",
      details: "Missing receipt documentation",
      ipAddress: "192.168.1.105"
    }
  ]);
  
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    let filtered = auditEvents;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.details && event.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(event => event.resourceType.toLowerCase() === filterType);
    }
    
    setFilteredEvents(filtered);
  }, [auditEvents, searchTerm, filterType]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "Expense":
        return <FileText className="h-4 w-4" />;
      case "User":
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "Created":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Created</Badge>;
      case "Updated":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Updated</Badge>;
      case "Deleted":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Deleted</Badge>;
      case "Approved":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const handleExport = (format: string) => {
    console.log(`Exporting audit trail as ${format}`);
    // In a real app, this would export the data
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Audit Trail</h2>
        <p className="text-muted-foreground">Track all activities and changes in the system</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Audit Events
          </CardTitle>
          <CardDescription>Search and filter audit trail records</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by user, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              All
            </Button>
            <Button 
              variant={filterType === "Expense" ? "default" : "outline"}
              onClick={() => setFilterType("Expense")}
              size="sm"
            >
              Expenses
            </Button>
            <Button 
              variant={filterType === "User" ? "default" : "outline"}
              onClick={() => setFilterType("User")}
              size="sm"
            >
              Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>All system activities in chronological order</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No audit events found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 text-muted-foreground">
                        {getResourceIcon(event.resourceType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{event.user}</span>
                          {getActionBadge(event.action)}
                          <span className="text-muted-foreground">{event.resource}</span>
                        </div>
                        {event.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.details}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {event.timestamp.toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {event.ipAddress && (
                            <span>IP: {event.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="mt-2 md:mt-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Audit Trail Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEvents.length}</div>
            <p className="text-xs text-muted-foreground">All recorded events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Actions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEvents.filter(e => e.resourceType === "User").length}
            </div>
            <p className="text-xs text-muted-foreground">User management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Actions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEvents.filter(e => e.resourceType === "Expense").length}
            </div>
            <p className="text-xs text-muted-foreground">Expense management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(auditEvents.map(e => e.user)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Audit Trail</CardTitle>
          <CardDescription>Download audit records for compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => handleExport("CSV")}>
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("PDF")}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("JSON")}>
              <Download className="mr-2 h-4 w-4" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;