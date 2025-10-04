import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, DollarSign, Users, Shield, Zap, Brain, Info } from "lucide-react";
// Removed LanguageSelector and NotificationSystem imports

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            SmartExpense
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          {/* Removed LanguageSelector and NotificationSystem */}
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth?mode=signin")}
            className="border-green-600 text-green-400 hover:bg-green-600/20 transition-all duration-300"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/auth?mode=signup")}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/about")}
            className="text-green-400 hover:text-green-300 hover:bg-green-900/50 transition-all duration-300"
          >
            <Info className="mr-2 h-4 w-4" />
            About Us
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-green-900/50 px-4 py-1.5 text-sm font-medium text-green-400 border border-green-800 mb-4 backdrop-blur-sm">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Expense Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
            SmartExpense
            <span className="block text-3xl md:text-4xl mt-4 font-medium">AI-Powered Expense Management</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Streamline your expense approvals with multi-level workflows, currency conversion, and powerful analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 px-8 py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth?mode=signin")}
              className="border-2 border-green-600 text-green-400 hover:bg-green-600/20 px-8 py-6 text-lg rounded-lg transition-all duration-300 backdrop-blur-sm"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          {[
            {
              icon: <CheckCircle className="h-8 w-8 text-green-400" />,
              title: "Multi-Level Approval",
              description: "Configure sequential approval workflows with managers and admins"
            },
            {
              icon: <DollarSign className="h-8 w-8 text-green-400" />,
              title: "Currency Conversion",
              description: "Automatic conversion to company currency using real-time exchange rates"
            },
            {
              icon: <Users className="h-8 w-8 text-green-400" />,
              title: "Role-Based Access",
              description: "Admin, manager, and employee dashboards with tailored permissions"
            },
            {
              icon: <Brain className="h-8 w-8 text-green-400" />,
              title: "AI Fraud Detection",
              description: "Detect duplicate receipts and suspicious claims with machine learning"
            },
            {
              icon: <Shield className="h-8 w-8 text-green-400" />,
              title: "Secure & Compliant",
              description: "Audit trails and policy enforcement for complete compliance"
            },
            {
              icon: <Zap className="h-8 w-8 text-green-400" />,
              title: "Real-time Analytics",
              description: "Insights and forecasting for smarter financial decisions"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="text-center space-y-4 p-6 rounded-xl bg-gray-800/30 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 backdrop-blur-sm transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-700/30 to-emerald-800/30 rounded-full flex items-center justify-center mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-12 border border-green-800/50 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Transform Your Expense Management Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Join thousands of companies streamlining their expense processes with SmartExpense
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 px-8 py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Start Free Trial
          </Button>
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Stay Updated</h2>
              <p className="text-gray-400 mb-6">
                Subscribe to our newsletter for product updates and financial management tips
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 px-6 py-3 rounded-lg transition-all duration-300">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-gray-800">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  SmartExpense
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered expense management platform that streamlines the entire expense reimbursement process.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'facebook', 'github'].map((social) => (
                  <a 
                    key={social}
                    href={`https://www.${social}.com`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-900/50 transition-all duration-300"
                  >
                    <div className="w-5 h-5 bg-current rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Solutions', 'Pricing', 'Demo'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Resources</h4>
              <ul className="space-y-2">
                {['Blog', 'Help Center', 'Guides', 'API Docs'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Contact', 'Partners'].map((item) => (
                  <li key={item}>
                    <a 
                      href={item === 'About Us' ? '/about' : '#'} 
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} SmartExpense. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;