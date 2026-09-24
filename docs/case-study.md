# MyFinance — Full-Stack Personal Finance Application

## Project Overview

MyFinance is a full-stack personal finance management application designed to help users move from manual financial record-keeping to a structured digital system for managing income, expenses, accounts, transactions, financial reports, and tax estimates.

The project originated from a client who had been manually maintaining income and expense records. After deciding to move to electronic record-keeping, he approached me to develop a solution.

Rather than build only a simple income-and-expense recording tool for a single user, I expanded the idea into a more comprehensive application that could also be useful to other individuals who want an easier and more meaningful way to maintain and understand their financial records.

MyFinance evolved into a production-deployed full-stack application with authentication, account and category management, transaction tracking, financial dashboards, reporting and analytics, tax estimation, multiple currency preferences, automated testing, production security controls, and uptime monitoring.

## The Problem

Manual income and expense record-keeping can make financial information difficult to organize, review, and interpret over time.

The initial requirement was straightforward: replace a manual record-keeping process with a digital income and expense system.

I identified an opportunity to go beyond simply reproducing the manual process electronically. A useful financial application should not only store records; it should help users organize those records and turn them into information they can understand.

This led to a broader product objective: build a personal finance application that could allow users to:

- Maintain their financial accounts.
- Categorize income and expenses.
- Record and manage transactions.
- Monitor income, expenses, and balances.
- Filter and search financial records.
- Analyze financial activity through dashboards and charts.
- Generate reports for different periods.
- Review spending patterns and savings indicators.
- Estimate tax obligations.
- Maintain an individual currency preference.

## My Role

I designed and developed MyFinance as a full-stack software project, working across the frontend, backend, database, testing, deployment, and production-monitoring layers.

My responsibilities included:

- Translating the original income-and-expense requirement into a broader product specification.
- Designing the application's frontend and backend structure.
- Developing the React user interface.
- Building the Express REST API.
- Designing and evolving the MySQL database with Prisma ORM.
- Implementing authentication and authorization.
- Building account, category, transaction, reporting, profile, and tax functionality.
- Writing frontend and backend automated tests.
- Preparing the application for production.
- Deploying the frontend, backend, and production database.
- Debugging deployment-specific issues.
- Implementing application health monitoring.
- Performing post-deployment production QA.
- Preparing the project for portfolio presentation.

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Chart.js
- react-chartjs-2
- Vitest
- Testing Library

### Backend

- Node.js
- Express
- JavaScript
- JWT authentication
- bcrypt
- express-validator
- Helmet
- express-rate-limit
- Jest
- Supertest

### Database

- MySQL
- Prisma ORM

### Deployment & Monitoring

- Vercel — frontend hosting
- Railway — backend hosting
- Railway MySQL — production database
- UptimeRobot — external uptime and health monitoring

## Architecture

MyFinance uses a separated full-stack architecture in which the React frontend communicates with an Express REST API, while Prisma provides the data-access layer between the backend and MySQL.

The production architecture is:

```text
User
  |
  v
React / Vite Frontend
Vercel
  |
  | HTTPS REST API requests
  v
Node.js / Express API
Railway
  |
  v
Prisma ORM
  |
  v
MySQL
Railway


## Key Engineering Decisions

### Separation of Concerns

One of the most important lessons from the project was the value of keeping files and modules focused on specific responsibilities.

Instead of placing routing, validation, business logic, database access, and response handling in a single location, the backend was organized into areas such as:

Routes
Controllers
Services
Validators
Middleware
Helpers
Configuration
Utilities

The frontend similarly separates pages, reusable components, layouts, API communication, utilities, configuration, and constants.

This structure made the application easier to reason about, test, debug, and extend as it grew beyond the original income-and-expense requirement.

### User-Owned Financial Data

MyFinance was designed as a multi-user application rather than a single shared financial ledger.

Accounts, categories, and transactions are associated with individual users. Backend operations validate ownership so that authenticated users work with their own financial records.

This became an important architectural requirement once the project expanded from solving one client's problem into an application intended for broader use.

### One Preferred Currency Per User

Rather than introducing automatic currency conversion and the complexity of exchange-rate management, MyFinance uses one preferred currency for each user.

The backend stores financial values as numbers, while the frontend formats those values according to the user's selected currency.

The application currently supports:

- Nigerian Naira (NGN)
- US Dollar (USD)
- British Pound Sterling (GBP)
- Euro (EUR)

This keeps the financial model predictable while still supporting users who work with different currencies.

### Reporting Through Reusable Date Ranges

The reporting system supports predefined periods such as Today, Week, Month, and Year as well as custom date ranges.

Instead of creating separate backend endpoints for every possible reporting period, the frontend can translate these period selections into date ranges and use the generic reporting capability where appropriate.

This reduces unnecessary API duplication while keeping the reporting interface convenient for users.

### Default Categories

New users automatically receive a useful starting set of income and expense categories during registration.

This reduces setup work and allows a newly registered user to begin recording transactions quickly, while still allowing custom categories to be created later.

The creation of the user and the associated default categories is handled as part of the registration workflow so that the initial account setup remains consistent.

### Production Configuration

Development and production environments use environment-based configuration rather than hard-coded service URLs or credentials.

The frontend obtains its production API location from environment configuration, while the backend validates important production settings such as the database connection, JWT secret, and permitted frontend origin.

This made the same codebase usable locally and in production without embedding deployment-specific secrets into source control.

## Key Challenges and Solutions

### Moving From Local Development to Production

Deployment was the most challenging and educational stage of the project.

MyFinance had been developed and tested locally, but making it available to real users required coordinating three production layers:

- The React frontend.
- The Express backend.
- The MySQL database.

I deployed the frontend to Vercel and the backend and production MySQL database to Railway.

This required moving from local configuration to environment-based production configuration, applying database migrations safely, configuring the frontend to communicate with the production API, and restricting backend CORS access to the deployed frontend.

The experience reinforced that completing an application locally is only part of delivering software. A product intended to solve a real user's problem must also be reliably accessible outside the development environment.

### Debugging a Production Environment Variable

One of the deployment-specific problems occurred after the frontend and backend had been deployed.

Registration failed in production with a JSON parsing error even though the feature worked during development.

Browser debugging revealed that the frontend was attempting to make the registration request using a malformed URL. The production API environment variable in Vercel had accidentally been entered in Markdown-link format rather than as a raw URL.

After identifying the malformed request in the browser, I corrected the environment variable and redeployed the frontend. Registration then worked successfully against the production backend.

This was an important lesson in tracing production failures across application boundaries rather than assuming that a working feature in development will automatically behave the same way after deployment.

### Supporting React Routes in Production

Another deployment issue appeared when directly visiting or refreshing frontend routes such as `/register`, `/login`, or `/dashboard`.

The React application used client-side routing, but the hosting platform also needed to know that application routes should be served through the main `index.html` entry point.

I added a Vercel rewrite configuration so that frontend routes resolve through the React application.

This ensured that navigation worked both when moving through the application normally and when a user directly opened or refreshed a nested route.

### Production Database Migrations

The development database already contained the schema evolution from earlier stages of the project, but production required a safe way to reproduce that schema without resetting or seeding the live database.

I used Prisma's deployment migration workflow to apply the existing migration history to the Railway MySQL database before starting the production server.

This separated production schema deployment from destructive development workflows and ensured that the production database structure was created from the project's migration history.

### Production Health Monitoring

After deployment, I wanted more than confirmation that the frontend could open in my browser. I wanted a way to determine whether the backend and its database dependency remained operational.

I added a dedicated `/health` endpoint to the Express application. The endpoint performs a minimal database connectivity check through Prisma.

A healthy application returns an HTTP 200 response indicating that the database is connected. If the application is running but the database check fails, the endpoint returns HTTP 503 without exposing sensitive internal details.

Automated tests cover both health-check outcomes.

I initially explored Better Stack for external monitoring, but its setup flow introduced integrations that were unnecessary for the project's monitoring requirements. I therefore selected UptimeRobot for a simpler setup.

Two external monitors were configured:

- A frontend monitor for the production application on Vercel.
- An API health monitor for the backend `/health` endpoint.

Email alert delivery was also verified.

This provided basic fault isolation: a frontend outage can be distinguished from a backend or database-health problem.

### Maintaining Confidence Through Automated Testing

As MyFinance expanded from a basic income-and-expense application into a larger financial system, changes began affecting multiple parts of the application.

To reduce regression risk, I developed automated tests for both the backend and frontend.

The final production-readiness baseline contains:

- 122 passing backend tests.
- 121 passing frontend tests.
- 243 automated tests in total.

The backend tests cover areas including authentication, accounts, categories, transactions, reports, tax functionality, application behavior, and health checks.

The frontend tests cover the application's pages, components, API interactions, authentication behavior, financial functionality, and user-facing workflows.

Automated testing became particularly valuable before and after production-related changes because it provided evidence that deployment preparation had not broken existing functionality.


## Testing and Quality Assurance

Testing became an important part of the development process as the application grew.

MyFinance uses automated testing on both sides of the application:

- Jest and Supertest for backend testing.
- Vitest and Testing Library for frontend testing.

At the production-readiness baseline, the project had:

- 122 passing backend tests.
- 121 passing frontend tests.
- 243 passing automated tests in total.

Testing was complemented by manual production QA after deployment.

The deployed application was reviewed for:

- Mobile and responsive behavior.
- Keyboard accessibility.
- Browser console and runtime errors.
- Failed API/network requests.
- Direct navigation and refresh of frontend routes.
- Form validation.
- Invalid and negative transaction amounts.
- Empty transaction and reporting states.
- Duplicate categories.
- Record deletion.
- Authentication persistence.
- Logout and protected-route behavior.

These checks helped verify not only that individual functions worked in isolation, but that the deployed application behaved correctly from a user's perspective.

## Security and Production Readiness

Several measures were implemented to prepare the application for production.

These include:

- Password hashing with bcrypt.
- JWT-based authentication.
- Protected frontend and backend routes.
- User ownership validation for financial records.
- Request validation with express-validator.
- Helmet for HTTP security headers.
- Rate limiting.
- Environment-based secret and configuration management.
- Production CORS configuration.
- Generic handling of unexpected server errors.
- Production database migrations through Prisma.
- Graceful server shutdown and database disconnection.
- Separation of development and production configuration.

Sensitive credentials and production environment values are not committed to the repository.

## Deployment and Production Monitoring

The final application is deployed using separate services for the frontend and backend.

The React frontend is hosted on Vercel, while the Express API and MySQL database are hosted on Railway.

The production deployment process includes applying Prisma migrations before starting the backend application.

A dedicated backend health endpoint verifies both application availability and database connectivity.

External monitoring is provided through UptimeRobot, with separate monitors for:

- The Vercel frontend.
- The Railway backend health endpoint.

Email alert delivery was tested to confirm that monitoring notifications can reach the configured recipient.

## Results

MyFinance progressed from a request for a digital replacement for manual income-and-expense record-keeping into a deployed full-stack financial application.

The completed application provides users with tools for:

- Managing financial accounts.
- Organizing income and expense categories.
- Recording and reviewing transactions.
- Searching, filtering, sorting, and navigating financial records.
- Viewing dashboard summaries and charts.
- Generating financial reports across different periods.
- Reviewing spending and savings indicators.
- Estimating tax obligations.
- Managing profile and currency preferences.

The project is publicly accessible through its production deployment rather than existing only as a local development project.

The production application was also subjected to post-deployment responsive, accessibility, browser/runtime, and functional edge-case QA.

## What I Learned

The most significant learning experience from MyFinance was taking a full-stack application beyond local development and making it available in production.

Before this project, I had not deployed this architecture using Vercel and Railway or established external uptime monitoring for it. Working through production configuration, database migrations, CORS, frontend routing, environment variables, deployment debugging, health checks, and monitoring gave me practical experience with the operational side of software development.

The project also reinforced the importance of separation of concerns.

As the application became larger, keeping files and modules focused on individual responsibilities made the codebase easier to understand, debug, test, and extend. This influenced how I structured controllers, services, routes, validators, middleware, utilities, frontend components, pages, and API modules.

Another important lesson was that successful local development is not the final measure of whether software solves a user's problem. The application must be accessible and reliable for the people it was designed to serve.

For MyFinance, deployment was therefore not simply the last technical task. It was an essential part of completing the original objective.

## Future Improvements

Possible future improvements include:

- OpenAPI/Swagger API documentation.
- Structured production logging.
- Password reset and email recovery.
- Email verification.
- Refresh-token or session-revocation support.
- Additional financial analytics.
- Data export.
- A custom production domain.
- Further accessibility improvements.
- Additional responsive and mobile UX refinement.

These improvements can be introduced incrementally without changing the core architecture of the application.

## Project Links

- **Live Application:** https://my-finance-smoky-nine.vercel.app
- **Production API:** https://backend-production-9ed6.up.railway.app
- **Source Code:** https://github.com/AdeBeeY/myFinance
