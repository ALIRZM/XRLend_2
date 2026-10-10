import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import Shell from "../components/Shell";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import StatusChip from "../components/StatusChip";
import { CARD, MUTED, TITLE, ERRBOX, PAGE } from "../components/ui";

const AdminHeadsets = () => {
  const { user } = useAuth();

  const [headsets, setHeadsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadHeadsets = () => {
    setLoading(true);
    setError("");

    axiosInstance
      .get("/api/headsets/admin")
      .then(({ data }) => { setHeadsets(data); })
      .catch((err) => {
        setHeadsets([]);
        setError(err.response?.data?.message || "Could not load the headsets");
      })
      .finally(() => { setLoading(false); });
  };
  
  useEffect(() => { loadHeadsets(); }, []);
  
  return (
    <Shell>
      <TopBar title="Headsets" role={user?.role} />
      <div className={PAGE}>
        {error && (<div className={ERRBOX} role="alert">{error}</div>)}
        
        {loading && (
          <p className={`${MUTED} self-center`}>
            Loading headsets...
          </p>
        )}
        
        {!loading && !error && headsets.length === 0 && (
          <p className={`${MUTED} self-center`}>
            No headsets found
          </p>
        )}
        
        {headsets.map((headset) => (
          <div key={headset._id} className={`${CARD} flex items-center gap-2.5`}>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <span className={TITLE}>{headset.model}</span>
              <span className={MUTED}>Asset Tag: {headset.assetTag}</span>
            </div>

            <StatusChip status={headset.status} />
          </div>
        ))}
      </div>

      <BottomNav />
    </Shell>
  );
};

export default AdminHeadsets;
