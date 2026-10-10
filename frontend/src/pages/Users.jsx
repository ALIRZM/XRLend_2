import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import Shell from "../components/Shell";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { CARD, MUTED, TITLE, ERRBOX, PAGE } from "../components/ui";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/api/users")
      .then(({ data }) => setUsers(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load the users"),
      );
  }, []);

  return (
    <Shell>
      <TopBar title="Users" role={user?.role} />
      <div className={PAGE}>
        {error && (
          <div className={ERRBOX} role="alert">
            {error}
          </div>
        )}

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
