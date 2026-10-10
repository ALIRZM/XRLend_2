import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Shell from '../components/Shell';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StatusChip from '../components/StatusChip';
import { CARD, FIELD, BTN, BTN_ALT, MUTED, TITLE, H2, ERRBOX, OKBOX, PAGE } from '../components/ui';

// R9: a technician adds headsets and sees the inventory
const Headsets = () => {
  const { user } = useAuth();
  const [headsets, setHeadsets] = useState([]);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ model: '', assetTag: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  
  const [filterMaintenance, setFilterMaintenance] = useState(false);

  const load = useCallback(() => {
    axiosInstance.get(`/api/headsets${filterMaintenance ? '?status=Maintenance' : ''}`)
      .then(({ data }) => setHeadsets(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the inventory'));
  }, [filterMaintenance]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return headsets;
    return headsets.filter((h) =>
      h.model.toLowerCase().includes(q) ||
      h.assetTag.toLowerCase().includes(q) ||
      h.status.toLowerCase().includes(q));
  }, [headsets, submitted]);

  const add = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    try {
      await axiosInstance.post('/api/headsets', form);
      setNotice(`${form.model} added.`);
      setForm({ model: '', assetTag: '' });
      setAdding(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add that headset');
    }
  };

  const updateStatus = async (id, newStatus) => {
    setError(''); setNotice('');
    try {
      await axiosInstance.put(`/api/headsets/${id}/status`, { status: newStatus });
      setNotice(`Headset status updated to ${newStatus}.`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleEditNotes = (h) => {
    setEditingNotesId(h._id);
    setEditingNotesText(h.notes || '');
  };

  const saveNotes = async (id) => {
    setError(''); setNotice('');
    try {
      await axiosInstance.put(`/api/headsets/${id}/notes`, { notes: editingNotesText });
      setNotice('Repair notes updated.');
      setEditingNotesId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update notes');
    }
  };

  return (
    <Shell>
      <TopBar title="Headsets" role={user?.role} />
      <div className={PAGE}>
        {error && <div className={ERRBOX} role="alert">{error}</div>}
        {notice && <div className={OKBOX} role="status">{notice}</div>}

        <input className={FIELD} type="search" placeholder="Search for headset"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" onClick={() => setSubmitted(query)} className={BTN_ALT}>Search</button>

        <div className="flex justify-between items-center w-full mb-2 mt-2">
          <p className={`${MUTED}`}>Tap a headset to see its model, asset tag and status.</p>
          {user?.role === 'technician' && (
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterMaintenance} 
                onChange={(e) => setFilterMaintenance(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              Needs Maintenance
            </label>
          )}
        </div>

        {user?.role === 'technician' && (
          <button type="button" onClick={() => setAdding(!adding)} className={BTN}>Add a headset</button>
        )}

        {adding && (
          <form onSubmit={add} className={`${CARD} flex flex-col gap-3`}>
            <h2 className={H2}>Add a headset</h2>
            <input className={FIELD} required placeholder="Model"
              value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <input className={FIELD} required placeholder="Asset tag"
              value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} />
            <button type="submit" className={BTN}>Add headset</button>
          </form>
        )}

        {filtered.map((h) => (
          <div key={h._id} className={`${CARD} flex flex-col gap-3`}>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex flex-col justify-center gap-2">
                <span className={TITLE}>{h.model}</span>
                <div className="flex items-center gap-2">
                  <span className={MUTED}>{h.assetTag}</span>
                  {h.hasActiveLoan && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      On Loan
                    </span>
                  )}
                </div>
              </div>
              <StatusChip status={h.status} />
            </div>
            
            {user?.role === 'technician' && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                <span className="text-sm font-medium text-gray-500">Update Status:</span>
                <select 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                  value={h.status}
                  onChange={(e) => updateStatus(h._id, e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            )}

            {/* View/Edit Notes Section */}
            <div className="pt-2 border-t border-gray-100 mt-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Repair Notes:</span>
                {user?.role === 'technician' && editingNotesId !== h._id && (
                  <button onClick={() => handleEditNotes(h)} className="text-xs text-blue-600 font-semibold uppercase hover:underline">Edit Notes</button>
                )}
              </div>
              
              {editingNotesId === h._id ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    className="w-full h-20 p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingNotesText}
                    onChange={(e) => setEditingNotesText(e.target.value)}
                    placeholder="Enter maintenance or repair notes here..."
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingNotesId(null)} className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={() => saveNotes(h._id)} className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800">Save Notes</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-md italic border border-gray-100 min-h-[40px]">
                  {h.notes || 'No repair notes provided.'}
                </p>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !error && (
          <p className={`${MUTED} w-full text-center py-4`}>
            {filterMaintenance ? "No devices currently need maintenance" : "No headsets found."}
          </p>
        )}
      </div>
      <BottomNav />
    </Shell>
  );
};
export default Headsets;
