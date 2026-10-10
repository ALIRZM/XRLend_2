import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const icons = {
  find: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </>
  ),
  loans: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  requests: (
    <>
      <path d="M3 13h4l2 3h6l2-3h4M5 5h14l2 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" />
    </>
  ),
  headsets: (
    <>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2.2.7 3.5 2.3 3.5 5.2" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
};

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabsByRole = {
    admin: [{ to: "/admin/users", label: "Users", icon: "users" }],
    technician: [
      { to: "/requests", label: "Requests", icon: "requests" },
      { to: "/headsets", label: "Headsets", icon: "headsets" },
    ],
    student: [
      { to: "/find", label: "Find", icon: "find" },
      { to: "/loans", label: "My loans", icon: "loans" },
    ],
  };
  const tabs = tabsByRole[user?.role] || tabsByRole.student;
  // One tab plus Account fills two columns, two tabs plus Account fills three
  const columns = tabs.length === 1 ? "grid-cols-2" : "grid-cols-3";

  const item = (active) =>
    `h-[46px] flex flex-col items-center justify-center gap-1.5 rounded-2xl ${active ? "" : "opacity-40"}`;

  return (
    <nav className="w-full h-[84px] bg-white border border-solid border-black px-4 py-3">
      <div className={`grid ${columns} bg-white rounded-2xl`}>
        {tabs.map((t) => (
          <button
            key={t.to}
            type="button"
            onClick={() => navigate(t.to)}
            aria-current={pathname === t.to ? "page" : undefined}
            className={item(pathname === t.to)}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="black"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[t.icon]}
            </svg>
            <span className="text-black text-[13px] text-center">
              {t.label}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          aria-current={pathname === "/profile" ? "page" : undefined}
          className={item(pathname === "/profile")}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="black"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icons.account}
          </svg>
          <span className="text-black text-[13px] text-center">Account</span>
        </button>
      </div>
    </nav>
  );
};
export default BottomNav;
