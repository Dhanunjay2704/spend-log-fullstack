# 💰 Spend Log - Smart Finance Tracker

A full-stack personal finance management application built with React.js, Node.js, Express, and MongoDB. Track your expenses, set budgets, achieve savings goals, and gain insights into your spending habits.


## 🚀 Live Demo

- **Frontend:** https://spend-log-frontend-j2po.onrender.com
- **Backend API:** https://spend-log-backend.onrender.com

## ✨ Features

### 📊 Dashboard
- Real-time financial overview with metrics
- Income vs Expense comparison charts
- Spending by category visualization
- Daily spending trends
- Savings rate calculation

### 💰 Transaction Management
- Add income and expenses with categories
- Categorize transactions (Food, Transport, Bills, etc.)
- Edit and delete transactions
- Monthly transaction history

### 💼 Budget Planning
- Set monthly budgets for each category
- Visual progress bars showing budget usage
- Budget vs actual spending comparison
- Over-budget alerts

### 🎯 Savings Goals
- Set personalized savings targets
- Track progress with visual indicators
- Calculate daily savings needed
- Goal completion tracking

### 📅 Calendar View
- Visual calendar showing daily spending
- Color-coded days (income vs expense days)
- Monthly overview of financial activity

### 📤 Data Export
- Export transactions to CSV format
- Export data to JSON for analysis
- Date-range filtering for exports

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Recharts** - Data visualization
- **CSS3** - Styling
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Deployment
- **Render** - Hosting (Frontend & Backend)
- **MongoDB Atlas** - Cloud database
- **Vercel** - Alternative hosting

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Dhanunjay2704/spend-log-fullstack.git
cd spend-log-fullstack
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Environment Configuration**
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/spend_log
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Environment Configuration**
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

6. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  currency: String,
  monthlyIncome: Number,
  role: String
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  type: String (income/expense),
  category: String,
  description: String,
  date: Date
}
```

### Budget Model
```javascript
{
  userId: ObjectId,
  category: String,
  amount: Number,
  month: Number,
  year: Number
}
```

### SavingsGoal Model
```javascript
{
  userId: ObjectId,
  goalAmount: Number,
  currentAmount: Number,
  targetDate: Date,
  name: String,
  description: String
}
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy as Web Service

### Frontend Deployment (Render)
1. Connect GitHub repository to Render  
2. Set environment variables
3. Deploy as Static Site

### Environment Variables for Production
```env
# Backend
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_production_secret
NODE_ENV=production
CORS_ORIGIN=your-frontend-url

# Frontend
VITE_API_BASE_URL=your-backend-api-url
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats/overview` - Get statistics

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Set budget
- `DELETE /api/budgets/:id` - Delete budget

### Savings
- `GET /api/savings` - Get savings goal
- `POST /api/savings` - Set savings goal
- `PUT /api/savings` - Update savings goal
- `DELETE /api/savings` - Delete savings goal

## 🎯 Usage Guide

### Getting Started
1. **Register** a new account
2. **Set your currency** and monthly income
3. **Add transactions** to track spending
4. **Set budgets** for different categories
5. **Create savings goals** for financial targets

