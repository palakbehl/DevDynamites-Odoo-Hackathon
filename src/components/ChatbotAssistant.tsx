import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot, 
  Plus, 
  History,
  Settings,
  HelpCircle
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatbotAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your SmartExpense AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(() => {
      const botResponses = [
        "I've found 3 pending expense claims that require your attention. Would you like me to show them to you?",
        "Your most recent expense claim for $42.50 at Starbucks has been approved by your manager.",
        "You have 2 upcoming approval deadlines this week. Would you like me to remind you?",
        "I can help you submit a new expense claim. Just tell me the amount, category, and date.",
        "Your team's expense approval rate is currently at 85%, which is above the company average.",
        "I've detected a potential policy violation in your recent travel expense. Would you like me to explain?",
      ];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    let message = "";
    
    switch (action) {
      case "submit":
        message = "Submit a $50 taxi expense from yesterday";
        break;
      case "pending":
        message = "Show me my pending claims";
        break;
      case "approvals":
        message = "Show me pending approvals";
        break;
      case "claims":
        message = "List top 5 highest claims this month";
        break;
      default:
        message = action;
    }
    
    setInputText(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user" 
                      ? "bg-primary text-primary-foreground ml-2" 
                      : "bg-muted text-muted-foreground mr-2"
                  }`}>
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.sender === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-muted rounded-bl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground mr-2 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2 rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Actions */}
          <div className="border-t p-4 bg-muted/50">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction("submit")}
                className="text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Submit Expense
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction("pending")}
                className="text-xs"
              >
                <History className="mr-1 h-3 w-3" />
                Pending Claims
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction("approvals")}
                className="text-xs"
              >
                <HelpCircle className="mr-1 h-3 w-3" />
                Approvals
              </Button>
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about expenses..."
                className="flex-1 resize-none"
                rows={2}
              />
              <Button 
                onClick={handleSend} 
                disabled={!inputText.trim() || isLoading}
                className="self-end h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Chatbot Features */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Expense Help
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get help with submitting and managing expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Policy Info
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Learn about company expense policies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center">
              <History className="mr-2 h-4 w-4" />
              Claim Status
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check the status of your expense claims
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotAssistant;