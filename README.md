# 💼 SmartExpense – AI-Powered Expense Management & Reimbursement Platform

SmartExpense is a modern, AI-powered expense management platform that streamlines the entire expense reimbursement process for companies of all sizes. With intelligent automation, multi-level approval workflows, and advanced analytics, SmartExpense eliminates the inefficiencies of traditional expense management systems.

## 🎯 Key Features

### 🔐 Authentication & User Management
- **Admin Auto-Creation**: First user signup automatically creates an admin account
- **Role-Based Access Control**: Admin, Manager, and Employee roles with appropriate permissions
- **User Management**: Admins can create and manage employees with assigned roles

### 🧾 Expense Submission (Employee Role)
- **Intuitive Form**: Simple expense submission with amount, currency, category, description, and date
- **OCR Integration**: Automatic receipt scanning and data extraction (simulated in this demo)
- **Expense History**: View all submitted expenses with status tracking (Approved, Pending, Rejected)

### ✅ Approval Workflow (Manager/Admin Role)
- **Multi-Level Approval**: Configurable sequential approval flows (Manager → Finance → Director)
- **Conditional Rules**: Percentage-based, specific approver, and hybrid approval rules
- **Approve/Reject with Comments**: Approvers can provide feedback during the review process

### 📊 Analytics Dashboard
- **Expense Insights**: Visualize spending patterns with interactive charts
- **Category Analysis**: See where money is being spent across different categories
- **Trend Analysis**: Monthly and daily expense trends
- **Team Performance**: Approval rates and processing times
- **Export Reports**: Download analytics as CSV or PDF

### 🤖 AI Fraud Detection
- **Duplicate Receipt Detection**: Identifies identical or similar receipts
- **Anomaly Detection**: Flags unusual spending patterns
- **Policy Violation Checks**: Automatically verifies expenses against company policies
- **Real-time Monitoring**: Continuous scanning of new submissions

### 💬 AI Chatbot Assistant
- **Natural Language Interface**: Employees can interact with the system using conversational commands
- **Expense Management**: Submit expenses, check claim status, and get policy information
- **Manager Queries**: Review pending approvals and analyze team spending
- **24/7 Availability**: Always-on assistance for common expense questions

### 🌟 Additional Features
- **Currency Conversion**: Automatic conversion using real-time exchange rates
- **Multi-Language Support**: Interface available in multiple languages
- **Notification System**: Real-time alerts for submissions, approvals, and policy violations
- **Audit Trail**: Complete log of all system activities for compliance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠 Tech Stack

### Frontend
- **React.js**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn/UI**: Beautiful, accessible UI components
- **Recharts**: Data visualization library for analytics
- **React Router**: Declarative routing for React applications
- **React Query**: Server state management

### Backend
- **Node.js**: JavaScript runtime for building scalable network applications
- **Express.js**: Fast, unopinionated web framework
- **PostgreSQL**: Robust relational database system
- **JWT**: Secure authentication with JSON Web Tokens
- **Bcrypt**: Password hashing for security

### AI & ML Integrations
- **OCR Simulation**: Receipt scanning and data extraction (demo implementation)
- **Fraud Detection**: Anomaly detection algorithms (simulated in this demo)
- **Chatbot**: Conversational AI interface (simulated in this demo)

### External APIs
- **ExchangeRate-API**: Real-time currency conversion
- **REST Countries**: Country and currency information

## 📁 Project Structure

```
.
├── database/              # Database schema and migrations
├── public/                # Static assets
├── server/                # Backend API (Node.js + Express)
├── src/                   # Frontend source code
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Shadcn/UI components
│   │   └── ...            # Custom components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # API and database clients
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   └── App.tsx            # Main application component
├── supabase/              # Supabase configuration (if used)
├── README.md              # Project documentation
├── package.json           # Frontend dependencies
└── server/package.json    # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smartexpense
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

   Create a `.env` file in the server directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```

5. **Set up the database:**
   Run the database schema from `database/schema.sql` in your PostgreSQL database.

6. **Start the development servers:**
   ```bash
   # Terminal 1: Start the backend server
   npm run server
   
   # Terminal 2: Start the frontend development server
   npm run dev
   ```

   Or use the combined command:
   ```bash
   npm run dev:full
   ```

## 🎨 UI Components

SmartExpense uses a comprehensive set of UI components built with Shadcn/UI:

- **Cards**: Content containers with headers and descriptions
- **Buttons**: Various styles and sizes for different actions
- **Forms**: Input fields, textareas, and selects
- **Tabs**: Organize content in tabbed interfaces
- **Charts**: Data visualization with Recharts
- **Badges**: Status indicators and labels
- **Toasts**: Non-blocking notifications
- **Dialogs**: Modal windows for confirmations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **Role-Based Access**: Permissions enforced at both frontend and backend
- **Input Validation**: Server-side validation of all user inputs
- **SQL Injection Protection**: Parameterized queries to prevent injection attacks

## 📈 Analytics & Reporting

The analytics dashboard provides valuable insights into expense patterns:

- **Monthly Trends**: Visualize spending over time
- **Category Distribution**: See where money is being spent
- **Approval Metrics**: Track approval rates and processing times
- **Top Claimers**: Identify frequent expense submitters
- **Policy Violations**: Detect potential compliance issues

## 🤖 AI Features

SmartExpense incorporates several AI-powered features:

- **Receipt OCR**: Automatic data extraction from receipts
- **Fraud Detection**: Machine learning algorithms to detect anomalies
- **Chatbot Assistant**: Natural language interface for common tasks
- **Smart Categorization**: Automatic expense categorization

## 🌍 Internationalization

SmartExpense supports multiple languages and currencies:

- **Language Selector**: Switch between 12+ supported languages
- **Currency Conversion**: Real-time exchange rates for 20+ currencies
- **Localized Formatting**: Date, number, and currency formatting per locale

## 📱 Responsive Design

The application is fully responsive and works on all device sizes:

- **Mobile-First**: Designed for mobile devices first
- **Tablet Optimization**: Enhanced experience on tablet devices
- **Desktop Experience**: Full-featured interface for desktop users

## 🛠 Development Workflow

1. **Component Development**: Create reusable components in `src/components/`
2. **Page Creation**: Build pages in `src/pages/`
3. **API Integration**: Connect to backend services via `src/integrations/`
4. **State Management**: Use React Query for server state and React hooks for local state
5. **Styling**: Use Tailwind CSS classes for consistent styling
6. **Testing**: Write unit tests for critical components and functions

## 🤝 Contributing

We welcome contributions to SmartExpense! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for the icon library

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.