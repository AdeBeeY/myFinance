import { NavLink } from "react-router-dom";

function AppLayout({ children }) {
  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-2.5 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-x-6">
            <NavLink
              to="/dashboard"
              className="flex shrink-0 items-center justify-center gap-2 sm:justify-start"
              aria-label="MyFinance dashboard"
            >
              <img
                src="/favicon.png"
                alt=""
                className="h-9 w-9 rounded-lg"
              />

              <div className="leading-tight">
                <span className="block text-lg font-bold text-slate-900">
                  MyFinance
                </span>

                <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Track • Manage • Grow
                </span>
              </div>
            </NavLink>

            <nav
              aria-label="Main navigation"
              className="flex w-full flex-wrap items-center justify-center gap-1 sm:w-auto sm:flex-1 sm:justify-start"
            >
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
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;