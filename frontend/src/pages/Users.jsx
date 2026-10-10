import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import Shell from "../components/Shell";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { CARD, MUTED, TITLE, ERRBOX, PAGE } from "../components/ui";

const FILTERS = [
  { value: "", label: "All" },
  { value: "student", label: "Students" },
  { value: "technician", label: "Technicians" },
];

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axiosInstance
      .get("/api/users", { params: role ? { role } : {} })
      .then(({ data }) => setUsers(data))
      .catch((err) => {
        setUsers([]);
        setError(err.response?.data?.message || "Could not load the users");
      })
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <Shell>
      <TopBar title="Users" role={user?.role} />
      <div className={PAGE}>
        {error && (
          <div className={ERRBOX} role="alert">
            {error}
          </div>
        )}
        {/* Role tabs */}
        <div className="flex w-full bg-white rounded-2xl">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setRole(f.value)}
              aria-pressed={role === f.value}
              className={`flex-1 h-[46px] rounded-2xl px-2 text-base text-center ${
                role === f.value
                  ? "bg-[#343434] text-white"
                  : "bg-white text-[#667085]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* empty message */}
        {!loading && !error && users.length === 0 && (
          <p className={`${MUTED} self-center`}>
            {role ? "No users match this filter" : "No users found"}
          </p>
        )}
        {/* user list view */}
        {users.map((u) => (
          <div key={u._id} className={`${CARD} flex items-center gap-2.5`}>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <span className={TITLE}>{u.name}</span>
              <span className={`${MUTED} break-all`}>{u.email}</span>
            </div>
            <div className="bg-[#e7f2eb] rounded-lg px-3 py-[3px]">
              <span className="text-[#1c6440] text-base text-center capitalize">
                {u.role}
              </span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </Shell>
  );
};
export default Users;
