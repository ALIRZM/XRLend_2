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
  const [editingId, setEditingId] = useState(null);
  const [editModel, setEditModel] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  const handleEditClick = (headset) => {
    setEditingId(headset._id);
    setEditModel(headset.model);
    setEditStatus(headset.status);
    setEditNotes(headset.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditModel("");
    setEditStatus("");
    setEditNotes("");
  };

  const handleSaveEdit = () => {
    setError("");

    if (!editModel.trim()) {
      setError("Model is required");
      return;
    }

    axiosInstance
      .put(`/api/headsets/admin/${editingId}`, {
        model: editModel.trim(),
        status: editStatus,
        notes: editNotes
      })
      .then(() => {
        setEditingId(null);
        setEditModel("");
        setEditStatus("");
        setEditNotes("");
        loadHeadsets();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not update the headset");
      });
  };
  
  const handleDeleteClick = (headset) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${headset.assetTag}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    axiosInstance
      .delete(`/api/headsets/admin/${headset._id}`)
      .then(() => { loadHeadsets(); })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not delete the headset");
      });
  };

  useEffect(() => { loadHeadsets(); }, []);
  
  return (
    <Shell>
      <TopBar title="Headsets" role={user?.role} />
      <div className={PAGE}>
        {error && (<div className={ERRBOX} role="alert">{error}</div>)}
        
        {loading && (
          <p className={`${MUTED} self-center`}>Loading headsets...</p>
        )}
        
        {!loading && !error && headsets.length === 0 && (
          <p className={`${MUTED} self-center`}>No headsets found</p>
        )}
        
        {headsets.map((headset) => (
          <div key={headset._id} className={`${CARD} flex flex-col gap-3`}>
            {editingId === headset._id ? (
              <>
                <div>
                  <label className={MUTED}>Model</label>
                  <input 
                    type="text" 
                    value={editModel} 
                    onChange={(e) => setEditModel(e.target.value)} 
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className={MUTED}>Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className={MUTED}>Maintenance Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveEdit} className="rounded-lg border px-3 py-2 text-sm">Save</button>
                  <button type="button" onClick={handleCancelEdit} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                    <span className={TITLE}>{headset.model}</span>
                    <span className={MUTED}>Asset Tag: {headset.assetTag}</span>

                    {headset.notes && (
                      <span className={MUTED}>Notes: {headset.notes}</span>
                    )}
                  </div>

                  <StatusChip status={headset.status} />
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEditClick(headset)} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
                  <button type="button" onClick={() => handleDeleteClick(headset)} className="rounded-lg border px-3 py-2 text-sm">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </Shell>
  );
};

export default AdminHeadsets;
