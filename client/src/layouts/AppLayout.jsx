import { NavLink } from "react-router-dom";

function AppLayout({ children }) {
  const navLinkClass = ({ isActive }) =>
    `rounded px-3 py-2 text-sm font-medium ${
      isActive
        ? "bg-gray-900 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-4">
          <NavLink
            to="/dashboard"
            className={navLinkClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/accounts"
            className={navLinkClass}
          >
            Accounts
          </NavLink>

          <NavLink
            to="/categories"
            className={navLinkClass}
          >
            Categories
          </NavLink>

          <NavLink
            to="/transactions"
            className={navLinkClass}
          >
            Transactions
          </NavLink>

          <NavLink
            to="/reports"
            className={navLinkClass}
          >
            Reports
          </NavLink>

          <NavLink
            to="/tax"
            className={navLinkClass}
          >
            Tax
          </NavLink>

          <NavLink
            to="/profile"
            className={navLinkClass}
          >
            Profile
          </NavLink>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;