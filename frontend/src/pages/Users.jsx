import { useAuth } from "../context/AuthContext";
import Shell from "../components/Shell";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { PAGE, TITLE } from "../components/ui";

// XRH-25: the admin landing page. XRH-4 replaces this with the user list.
const Users = () => {
  const { user } = useAuth();

  return (
    <Shell>
      <TopBar title="Users" role={user?.role} />
      <div className={PAGE}>
        <p className={`${TITLE} self-start`}>Hello Admin</p>
      </div>
      <BottomNav />
    </Shell>
  );
};
export default Users;
