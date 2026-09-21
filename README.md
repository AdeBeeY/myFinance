# MyFinance

MyFinance is a full-stack personal finance management application built with **React**, **Express.js**, **MySQL**, and **Prisma ORM**.

It enables users to securely manage financial accounts, categorize income and expenses, record transactions, monitor financial performance, generate reports, visualize financial data, and estimate tax obligations.

The application is deployed as a production full-stack system using **Vercel** for the frontend and **Railway** for the backend and MySQL database.

## Live Application

- **Live Demo:** https://my-finance-smoky-nine.vercel.app
- **Production API:** https://backend-production-9ed6.up.railway.app

## Screenshots

### Dashboard

![MyFinance Dashboard](docs/screenshots/dashboard.png)

### Transactions

![MyFinance Transactions](docs/screenshots/transactions.png)

### Reports

![MyFinance Reports](docs/screenshots/reports.png)

---

## Features

### Authentication & Profile

- User registration
- Automatic creation of default income and expense categories
- User login
- JWT authentication
- Protected frontend and backend routes
- Password hashing with bcrypt
- Profile management
- Currency preference
- Change password
- Client-side logout

### Account Management

Users can:

- Create accounts
- View accounts
- View individual account details
- Update accounts
- Delete accounts
- Monitor account balances

### Category Management

- Income and expense category types
- Automatic default categories for new users
- Custom user-created categories
- Create, view, update, and delete categories
- User ownership validation

Default categories include examples such as:

**Income:** Salary, Business, Freelance, Investment, Bonus, Other

**Expense:** Food, Transport, Fuel, Rent, Electricity, Internet, Shopping, Entertainment, Medical, Education, Other

### Transaction Management

- Create transactions
- View transactions
- View transaction details
- Update transactions
- Delete transactions
- Income and expense transaction types
- Account validation
- Category validation
- Ownership validation
- Filtering
- Search
- Sorting
- Pagination

### Dashboard

The dashboard provides:

- Total income
- Total expenses
- Current balance
- Account, category, and transaction summaries
- Recent transactions
- Monthly income chart
- Monthly expense chart
- Income vs expense chart
- Category distribution chart
- Estimated tax summary

### Financial Reports

MyFinance includes reporting and analytics for:

- Dashboard summary
- Monthly reports
- Category analysis
- Custom date ranges
- Today
- Current week
- Current month
- Current year
- Monthly trends
- Cash flow
- Expense breakdown
- Top spending categories
- Largest transactions
- Income-to-expense ratio
- Savings rate
- Monthly savings trends
- Financial health

### Tax Tools

- Tax settings
- Tax calculation engine
- Estimated tax calculation
- Tax summary API
- Tax calculator frontend

### Currency Support

Each user has one preferred currency.

Supported currencies:

- NGN — Nigerian Naira
- USD — US Dollar
- GBP — British Pound
- EUR — Euro

MyFinance formats monetary values according to the user's selected currency. It does not automatically perform currency conversion.

---

# Tech Stack

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Chart.js
- react-chartjs-2
- Vitest
- Testing Library

## Backend

- Node.js
- Express.js
- JavaScript
- JWT
- bcrypt
- express-validator
- Helmet
- express-rate-limit
- Jest
- Supertest

## Database

- MySQL
- Prisma ORM

## Deployment

- Vercel — frontend
- Railway — backend
- Railway MySQL — production database

---

# Architecture

MyFinance uses a separated frontend/backend architecture:

```text
Browser
   |
   v
React / Vite Frontend
(Vercel)
   |
   | HTTPS REST API
   v
Express.js Backend
(Railway)
   |
   v
Prisma ORM
   |
   v
MySQL
(Railway)
```

The backend follows a layered structure with:

- Routes
- Validators
- Controllers
- Services
- Middleware
- Configuration
- Utilities
- Prisma data access

---

# Project Structure

```text
myFinance/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── test/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── helpers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

# Database Model

The primary entities are:

## User

Stores user information, authentication data, and currency preference.

Relationships:

- One User → Many Accounts
- One User → Many Categories
- One User → Many Transactions

## Account

Represents a financial account such as:

- Cash
- Bank account
- Savings
- Wallet

Each account belongs to one user.

## Category

Represents an income or expense classification.

Each category:

- belongs to one user
- has an `INCOME` or `EXPENSE` type

## Transaction

Represents financial activity.

A transaction contains information such as:

- Amount
- Transaction type
- Account
- Category
- Transaction date
- Description

Each transaction belongs to a user, account, and category.

---

# API Overview

The API uses the `/api` prefix.

## Authentication

| Method | Endpoint |
| --- | --- |
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/profile` |
| PUT | `/api/auth/profile` |
| PUT | `/api/auth/change-password` |

## Accounts

| Method | Endpoint |
| --- | --- |
| POST | `/api/accounts` |
| GET | `/api/accounts` |
| GET | `/api/accounts/:id` |
| PUT | `/api/accounts/:id` |
| DELETE | `/api/accounts/:id` |

## Categories

| Method | Endpoint |
| --- | --- |
| POST | `/api/categories` |
| GET | `/api/categories` |
| GET | `/api/categories/:id` |
| PUT | `/api/categories/:id` |
| DELETE | `/api/categories/:id` |

## Transactions

| Method | Endpoint |
| --- | --- |
| POST | `/api/transactions` |
| GET | `/api/transactions` |
| GET | `/api/transactions/:id` |
| PUT | `/api/transactions/:id` |
| DELETE | `/api/transactions/:id` |

## Reports

Key report endpoints include:

| Method | Endpoint |
| --- | --- |
| GET | `/api/reports/dashboard` |
| GET | `/api/reports/monthly` |
| GET | `/api/reports/categories` |
| GET | `/api/reports/date-range` |
| GET | `/api/reports/monthly-trends` |
| GET | `/api/reports/cash-flow` |
| GET | `/api/reports/expense-breakdown` |
| GET | `/api/reports/top-spending-categories` |
| GET | `/api/reports/largest-transactions` |
| GET | `/api/reports/income-expense-ratio` |
| GET | `/api/reports/savings-rate` |
| GET | `/api/reports/monthly-savings-trend` |
| GET | `/api/reports/financial-health` |

The frontend uses the generic date-range report to provide **Today**, **Week**, **Month**, **Year**, and **Custom** reporting periods.

---

# Local Development

## Prerequisites

Install:

- Node.js
- npm
- MySQL
- Git

## Clone the Repository

```bash
git clone git@github.com:AdeBeeY/myFinance.git
cd myFinance
```

## Install Backend Dependencies

```bash
cd server
npm install
```

## Configure Backend Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Configure:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=mysql://username:password@localhost:3306/myfinance

JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

Never commit the real `.env` file.

## Database Setup

Apply development migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client when required:

```bash
npx prisma generate
```

## Start the Backend

```bash
npm run dev
```

The local API runs on:

```text
http://localhost:5000
```

## Install Frontend Dependencies

In another terminal:

```bash
cd client
npm install
```

## Configure Frontend Environment

```bash
cp .env.example .env
```

Development value:

```env
VITE_API_URL=http://localhost:5000/api
```

## Start the Frontend

```bash
npm run dev
```

---

# Testing

## Backend

From `server/`:

```bash
npm test
```

The backend test suite covers areas including:

- Authentication
- Profile management
- Accounts
- Categories
- Transactions
- Reports
- Tax calculations
- Authorization and ownership checks
- API integration flows

Current regression baseline:

```text
10 test suites passed
120 tests passed
```

## Frontend

From `client/`:

```bash
npm test
```

Current regression baseline:

```text
27 test files passed
121 tests passed
```

Run frontend linting with:

```bash
npm run lint
```

Create a production build with:

```bash
npm run build
```

---

# Security

Production hardening includes:

- Required JWT secret configuration
- bcrypt password hashing
- JWT-protected API routes
- User ownership enforcement
- Helmet security headers
- Restricted CORS origin
- Authentication rate limiting
- JSON request body size limit
- Input validation with express-validator
- Sanitized production server errors
- Environment-based configuration
- Secrets excluded from source control
- Graceful server shutdown

---

# Production Deployment

## Frontend — Vercel

The React/Vite application is deployed from the `client` directory.

Production environment variable:

```env
VITE_API_URL=https://backend-production-9ed6.up.railway.app/api
```

`client/vercel.json` provides SPA fallback routing so direct navigation to React Router routes works correctly.

## Backend — Railway

The Express backend is deployed from the `server` directory.

Required production configuration includes:

```text
NODE_ENV
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
```

`PORT` is supplied by the hosting environment.

The production client origin is configured through `CLIENT_URL`.

## Production Database — Railway MySQL

Production schema changes are applied using committed Prisma migrations:

```bash
npm run prisma:deploy
```

which runs:

```bash
prisma migrate deploy
```

Development commands such as `prisma migrate reset` should not be used against the production database.

The development/demo seed is not part of the production deployment process.

---

# Production Verification

The deployed application has been smoke-tested end-to-end for:

- Registration
- Login
- Automatic default-category creation
- Dashboard loading
- Account creation
- Income transaction creation
- Expense transaction creation
- Dashboard totals
- Dashboard charts
- Reports
- Profile loading
- Logout and subsequent login
- Direct SPA route navigation

---

# Development Status

- ✅ Phase 1 — Project Foundation
- ✅ Phase 2 — User Registration
- ✅ Phase 3 — JWT Authentication & Protected Routes
- ✅ Phase 4 — Financial Data Models & Core Modules
- ✅ Phase 5 — Transaction Management
- ✅ Phase 6 — Dashboard & Reporting
- ✅ Phase 7 — Tax Calculator
- ✅ Phase 8 — Testing & Production Readiness
- ✅ Phase 9 — Production Deployment

MyFinance is now running as a deployed full-stack application.

---

# Engineering Practices Demonstrated

This project demonstrates:

- Full-stack application architecture
- RESTful API design
- Authentication and authorization
- Relational database design
- Prisma ORM and migrations
- React component architecture
- Protected client-side routing
- Backend validation
- Error handling
- Financial reporting and analytics
- Data visualization
- Automated backend and frontend testing
- Security hardening
- Query optimization
- Environment-based configuration
- CI-friendly production builds
- Cloud deployment
- Production database migration management

---

# Future Enhancements

Possible future enhancements include:

- OpenAPI/Swagger API documentation
- Structured production logging and monitoring
- Password reset/email recovery
- Email verification
- Refresh-token or session revocation support
- Additional analytics
- Data export
- Custom domain
- Accessibility improvements
- Further responsive/mobile UX improvements

---

# License

This project is intended for educational and portfolio development purposes.