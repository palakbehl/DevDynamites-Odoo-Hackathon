import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  CheckCircle, 
  Brain, 
  Shield, 
  Zap, 
  TrendingUp, 
  FileText, 
  Camera, 
  Globe,
  Award,
  Clock,
  BarChart3
} from "lucide-react";

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("features");

  const features = [
    {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "Multi-Level Approval Workflow",
      description: "Configurable sequential approval flows with managers, finance teams, and directors. Conditional approval rules for complex scenarios."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Currency Conversion",
      description: "Automatic conversion to company currency using real-time exchange rates. Support for 150+ global currencies."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Role-Based Access Control",
      description: "Admin, manager, and employee dashboards with tailored permissions. Comprehensive user management system."
    },
    {
      icon: <Brain className="h-8 w-8 text-green-500" />,
      title: "AI Fraud Detection",
      description: "Detect duplicate receipts and suspicious claims with machine learning. Policy compliance checking for all submissions."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure & Compliant",
      description: "Audit trails and policy enforcement for complete compliance. Bank-level security with end-to-end encryption."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      title: "Real-time Analytics",
      description: "Interactive dashboards with spending insights. Exportable reports in multiple formats for financial planning."
    },
    {
      icon: <Camera className="h-8 w-8 text-green-500" />,
      title: "OCR Receipt Processing",
      description: "Automatic receipt scanning and data extraction. Mobile app for on-the-go expense submission."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" />,
      title: "Global Expense Management",
      description: "Multi-company support with centralized reporting. Multi-language interface for international teams."
    }
  ];

  const benefits = [
    {
      stat: "75%",
      description: "Reduction in processing time"
    },
    {
      stat: "90%",
      description: "Increase in policy compliance"
    },
    {
      stat: "50%",
      description: "Decrease in administrative costs"
    },
    {
      stat: "24/7",
      description: "Access from any device"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            About SmartExpense
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Revolutionizing expense management with AI-powered automation and intelligent workflows
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setActiveTab("features")}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "features"
                  ? "bg-green-700 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab("benefits")}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "benefits"
                  ? "bg-green-700 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Benefits
            </button>
            <button
              onClick={() => setActiveTab("mission")}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "mission"
                  ? "bg-green-700 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Our Mission
            </button>
          </div>
        </div>

        {/* Features Section */}
        {activeTab === "features" && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {activeTab === "benefits" && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Proven Results</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300"
                >
                  <div className="text-4xl font-bold text-green-400 mb-2">{benefit.stat}</div>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Section */}
        {activeTab === "mission" && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300 mb-6">
                  At SmartExpense, we believe that managing business expenses shouldn't be a burden. 
                  Our mission is to eliminate the inefficiencies of traditional expense management 
                  systems through intelligent automation and user-centric design.
                </p>
                <p className="text-gray-300 mb-6">
                  Founded in 2023, our team of financial technology experts and AI researchers came 
                  together with a shared vision: to create a platform that transforms how organizations 
                  handle expense reporting and approval workflows.
                </p>
                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="text-center">
                    <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                    <p className="text-gray-400">Continuously pushing boundaries with AI and automation</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Security</h3>
                    <p className="text-gray-400">Enterprise-grade security protecting your financial data</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">User Focus</h3>
                    <p className="text-gray-400">Designed with real user feedback and needs in mind</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  Today, SmartExpense serves over 500 companies worldwide, processing millions of 
                  dollars in expense reports each month. We're committed to helping businesses of 
                  all sizes streamline their financial operations and focus on what matters most - 
                  growing their business.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Expense Management?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of companies streamlining their expense processes with SmartExpense
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </Button>
            <Button className="bg-transparent border-2 border-green-600 text-green-400 hover:bg-green-600/20 px-8 py-3 text-lg rounded-lg transition-all duration-300">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;