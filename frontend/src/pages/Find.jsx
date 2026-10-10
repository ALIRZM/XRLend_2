import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Shell from '../components/Shell';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { BTN, FIELD, CARD, MUTED, TITLE, H2, SUB, ERRBOX, PAGE } from '../components/ui';

// R10 and R13: only headsets with no clashing loan across the chosen dates
const Find = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dates, setDates] = useState({ start: '', end: '' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    setError(''); setResults(null);

    // Validation runs here, so nothing is sent until both dates are valid
    if (!dates.start || !dates.end) return setError('Pick both dates first.');
    if (new Date(dates.end) < new Date(dates.start)) {
      return setError('The return date is before the pick-up date. Choose a later return date.');
    }
    try {
      const { data } = await axiosInstance.get('/api/headsets/available', { params: dates });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not search right now');
    }
  };

  const pretty = (d) => (d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '');

  return (
    <Shell>
      <TopBar title="Find a headset" role={user?.role} back />
      <form onSubmit={search} className={PAGE}>
        <div className="flex justify-between w-full">
          {[['start', 'From'], ['end', 'To']].map(([k, label]) => (
            <label key={k} className="flex flex-col w-[171px] gap-0.5 py-[11px]">
              <span className={MUTED}>{label}</span>
              <input type="date" className={FIELD} value={dates[k]}
                onChange={(e) => setDates({ ...dates, [k]: e.target.value })} />
            </label>
          ))}
        </div>

        {error && <div className={ERRBOX} role="alert">{error}</div>}

        <button type="submit" className={BTN}>Search</button>

        {results !== null && <div className="w-[354px] h-px bg-[#cdcdcd]" />}

        {results !== null && results.length === 0 && (
          <div className="flex flex-col items-center w-full">
            <h2 className={`${H2} text-center`}>Nothing free {pretty(dates.start)} &ndash; {pretty(dates.end)}</h2>
            <p className={`${SUB} text-center`}>
              Every headset is booked across those dates. Try a shorter stay or a different week.
            </p>
          </div>
        )}

        {results !== null && results.length > 0 && (
          <p className={`${MUTED} self-start`}>Found for you</p>
        )}

        {results?.map((h) => (
          <div key={h._id} className={`${CARD} flex items-start gap-2.5`}>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <span className={TITLE}>{h.model}</span>
              <span className={MUTED}>{h.assetTag}</span>
              {h.notes && (
                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md italic mt-1 border border-gray-100">
                  {h.notes}
                </p>
              )}
            </div>
            <button type="button"
              onClick={() => navigate('/request', { state: { headset: h, dates } })}
              className="w-[101px] bg-[#04000b] rounded-xl px-[18px] py-3.5 text-white text-base font-medium leading-6">
              Request
            </button>
          </div>
        ))}
      </form>
      <BottomNav />
    </Shell>
  );
};
export default Find;
