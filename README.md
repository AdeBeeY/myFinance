# MyFinance

A modern full-stack personal finance management application built with **React**, **Express.js**, **MySQL**, and **Prisma ORM**. MyFinance helps users manage their financial accounts, categorize income and expenses, track transactions, and generate insightful financial reports through a secure REST API.

---

# Overview

MyFinance is designed to provide individuals with a simple yet powerful way to manage their finances.

The application enables users to:

- Securely register and log in
- Create and manage financial accounts
- Organize income and expense categories
- Record financial transactions
- Monitor account balances
- View financial dashboards
- Generate monthly financial reports
- Analyze spending by category

The project is being developed incrementally following professional software engineering practices, with each phase introducing new concepts, architectural improvements, and best practices.

---

# Features Completed

## Authentication

- User Registration
- User Login
- JWT Authentication
- Protected API Routes
- Password Hashing using bcrypt

---

## Category Management

- Create Category
- View Categories
- View Single Category
- Update Category
- Delete Category
- Income/Expense Category Types
- User Ownership Validation

---

## Account Management

- Create Account
- View Accounts
- View Single Account
- Update Account
- Delete Account

---

## Transaction Management

- Create Transaction
- View Transactions
- View Single Transaction
- Update Transaction
- Delete Transaction
- Account Validation
- Category Validation
- Income/Expense Type Validation

---

## Reporting

### Dashboard Summary

- Total Income
- Total Expense
- Current Balance
- Total Accounts
- Total Categories
- Total Transactions
- Five Most Recent Transactions

### Monthly Report

- Monthly Income
- Monthly Expense
- Monthly Balance
- Monthly Transaction Count

### Category Spending Report

- Expense grouped by category
- Total spending per category
- Sorted by highest spending

---

## Architecture Improvements

- Layered Architecture
- Service Layer
- Controller Layer
- Validation Layer
- Middleware
- Global Error Handling
- Async Handler
- Reusable API Response Helper
- Promise.all() query optimization
- Prisma aggregate()
- Prisma groupBy()

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- MySQL
- Prisma ORM

## Authentication

- JSON Web Token (JWT)
- bcrypt

## Validation

- express-validator

---

# Project Structure

```text
myFinance/
│
├── client/                 # React frontend
│
├── server/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── helpers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

# Database Schema Overview

The application currently contains the following primary entities:

## User

Stores registered user information.

Relationship:

- One User → Many Categories
- One User → Many Accounts
- One User → Many Transactions

---

## Category

Represents income and expense categories.

Examples:

- Salary
- Freelance
- Transport
- Food
- Rent

Each category belongs to one user.

---

## Account

Represents financial accounts.

Examples:

- Cash
- Bank Account
- Savings
- Wallet

Each account belongs to one user.

---

## Transaction

Represents financial activity.

Each transaction includes:

- Amount
- Transaction Type
- Category
- Account
- Transaction Date
- Description

Relationships:

- Many Transactions → One Category
- Many Transactions → One Account
- Many Transactions → One User

---

# API Endpoints

## Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/profile  |

---

## Categories

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /api/categories     |
| GET    | /api/categories     |
| GET    | /api/categories/:id |
| PUT    | /api/categories/:id |
| DELETE | /api/categories/:id |

---

## Accounts

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | /api/accounts     |
| GET    | /api/accounts     |
| GET    | /api/accounts/:id |
| PUT    | /api/accounts/:id |
| DELETE | /api/accounts/:id |

---

## Transactions

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /api/transactions     |
| GET    | /api/transactions     |
| GET    | /api/transactions/:id |
| PUT    | /api/transactions/:id |
| DELETE | /api/transactions/:id |

---

## Reports

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /api/reports/dashboard  |
| GET    | /api/reports/monthly    |
| GET    | /api/reports/categories |

---

# Installation

## Clone the repository

```bash
git clone <repository-url>
cd myFinance
```

---

## Install Frontend

```bash
cd client
npm install
```

---

## Install Backend

```bash
cd ../server
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
DATABASE_URL="mysql://username:password@localhost:3306/myfinance"
JWT_SECRET=your_super_secret_key
PORT=5000
```

---

## Run Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Start the Backend

```bash
npm run dev
```

---

## Start the Frontend

```bash
cd ../client
npm run dev
```

---

# Environment Variables

| Variable     | Description                        |
| ------------ | ---------------------------------- |
| DATABASE_URL | MySQL database connection string   |
| JWT_SECRET   | Secret key used to sign JWT tokens |
| PORT         | Express server port                |

---

# Development Progress

- ✅ Phase 1 — Project Foundation
- ✅ Phase 2 — User Registration
- ✅ Phase 3 — JWT Authentication
- ✅ Phase 4.1 — Financial Database Design
- ✅ Phase 4.2 — Category Management
- ✅ Phase 4.3 — Account Management
- ✅ Phase 5 — Transaction Management
- ✅ Phase 6 — Reporting Module
- 🚧 Phase 7 — Advanced Reporting & Analytics

---

# Future Roadmap

## Backend

- Advanced financial analytics
- Custom date range reports
- Cash flow reports
- Account summaries
- Pagination
- Filtering
- Search
- API documentation (OpenAPI/Swagger)
- Automated testing
- Logging
- Rate limiting
- Performance optimization

## Frontend

- Authentication pages
- Dashboard
- Charts and graphs
- Transaction management UI
- Account management UI
- Category management UI
- Reports dashboard
- Responsive design
- Dark mode

---

# Learning Objectives

This project is intentionally being developed in phases to demonstrate professional backend and full-stack development practices, including:

- Clean Architecture
- RESTful API Design
- Authentication & Authorization
- Database Design
- Prisma ORM
- Backend Validation
- Error Handling
- Reporting & Analytics
- Code Refactoring
- Performance Optimization
- Scalable Project Structure

---

# License

This project is intended for educational purposes and portfolio development.
