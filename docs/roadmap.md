# MyFinance Product Roadmap

This roadmap describes potential development beyond the MyFinance v1.0 production release.

The roadmap is intentionally prioritized by development horizon rather than representing a commitment to implement every listed feature. Priorities may change based on product usage, technical requirements, and user feedback.

---

## Current Production Baseline

MyFinance v1.0 provides a production-ready foundation including:

- User registration and authentication
- Profile and currency management
- Account management
- Income and expense categories
- Transaction management
- Search, filtering, sorting, and pagination
- Financial dashboard and visualizations
- Financial reports and analytics
- Tax estimation
- Automated backend and frontend tests
- Production health monitoring
- OpenAPI 3.1 API documentation
- Vercel frontend deployment
- Railway backend and MySQL deployment
- Branded production frontend at `https://myfinance.mydevplug.com.ng`
- Branded production API at `https://api.myfinance.mydevplug.com.ng`

The `v1.0.0` Git tag represents the first production release.

---

## Near-Term — v1.1

The near-term roadmap focuses primarily on strengthening the existing product rather than significantly expanding its scope.

### Account Recovery and Verification

Potential improvements:

- Password reset
- Email-based account recovery
- Email verification
- Recovery-token expiration and validation

### Data Export

Allow users to export financial records for use outside MyFinance.

Initial target:

- CSV transaction export
- Export using selected transaction filters or date ranges

Possible later formats may include additional structured or report-oriented exports.

### Observability

Improve visibility into production application failures and runtime behavior.

Potential improvements:

- Structured application logging
- Centralized error tracking
- Improved production diagnostics
- Appropriate separation of operational logs from sensitive user data

### Accessibility and Mobile UX

Continue improving usability across devices and interaction methods.

Areas for continued review:

- Keyboard navigation
- Focus states
- Form accessibility
- Screen-reader semantics
- Small-screen layouts
- Mobile navigation and transaction workflows

---

## Medium-Term — v1.2+

The medium-term roadmap focuses on deeper personal-finance capabilities.

### Budgeting and Spending Limits

Potential features:

- Monthly category budgets
- Spending limits
- Budget-versus-actual reporting
- Budget progress indicators

### Recurring Transactions

Support regularly occurring financial activity such as:

- Salary
- Rent
- Subscriptions
- Utility payments
- Other recurring income or expenses

### Financial and Savings Goals

Potential capabilities:

- Savings targets
- Goal progress tracking
- Target dates
- Progress visualization

### Additional Analytics

Expand the existing reporting system where additional analysis provides meaningful user value.

Potential areas include:

- Longer-term financial trends
- Spending comparisons
- Category trends
- Savings performance
- Account-level analytics

### Session Security

Potential authentication improvements:

- Refresh-token strategy
- Session revocation
- Logout across devices
- Improved session lifecycle management

---

## Long-Term / Optional

These features represent larger product or distribution decisions and should be driven by actual product needs.

### Progressive Web App

Potential PWA capabilities:

- Installable application experience
- Improved mobile experience
- Appropriate offline functionality
- Application manifest and service worker support

### Advanced Analytics

Potential advanced reporting capabilities may be considered as the product matures.

Any additional analytics should be driven by clear user needs rather than added solely to increase feature count.

---

## Engineering Improvements

Engineering work may continue independently of product features.

Potential improvements include:

- GitHub Actions for automated linting and testing
- Automated build verification
- Additional integration and end-to-end testing
- Performance profiling and optimization
- Dependency maintenance
- Security review and dependency auditing

Vercel and Railway already provide Git-based deployment workflows. Future CI work therefore focuses on automated quality gates rather than simply adding another deployment mechanism.

---

## Roadmap Principles

Future MyFinance development should follow these principles:

1. Protect the stability of the production application.
2. Prefer improvements that solve demonstrated user needs.
3. Maintain automated test coverage for new functionality.
4. Preserve clear API contracts and update OpenAPI documentation when APIs change.
5. Use database migrations for schema changes.
6. Avoid unnecessary complexity and premature scaling.
7. Treat security, accessibility, and data integrity as continuing requirements.
8. Release meaningful changes through clearly defined versions.

---

## Deferred Product Demo

A formal recorded product demo remains a planned documentation and portfolio task but is not required for continued application development.

The existing production application, screenshots, case study, API specification, and repository documentation provide the current project presentation baseline.
