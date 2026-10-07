import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Shell from '../components/Shell';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StatusChip from '../components/StatusChip';
import { CARD, MUTED, TITLE, ERRBOX, PAGE } from '../components/ui';

const pretty = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

// R11: a student sees their own loans, newest first
const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/loans/mine')
      .then(({ data }) => setLoans(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your loans'));
  }, []);

  return (
    <Shell>
      <TopBar title="My loans" role={user?.role} />
      <div className={PAGE}>
        {error && <div className={ERRBOX} role="alert">{error}</div>}
        {!error && loans.length === 0 && (
          <p className={`${MUTED} self-start`}>No loans yet. Search some dates to get started.</p>
        )}

        {loans.map((l) => (
          <div key={l._id} className={`${CARD} flex flex-col gap-2.5`}>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex flex-col justify-center gap-2">
                <span className={TITLE}>{l.headset?.model}</span>
                <span className={MUTED}>
                  {l.headset?.assetTag}&nbsp;&nbsp;.&nbsp;&nbsp;{pretty(l.startDate)} - {pretty(l.endDate)}
                </span>
                {l.headset?.notes && (
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md italic mt-1 border border-gray-100">
                    {l.headset?.notes}
                  </p>
                )}
              </div>
              <StatusChip status={l.status} />
            </div>
            {l.rejectionReason && (
              <div className="w-full rounded-xl bg-[#f9ebe9] px-[18px] py-[9px]">
                <p className="text-[#9c2e26] text-sm font-medium leading-[21px]">{l.rejectionReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <BottomNav />
    </Shell>
  );
};
export default MyLoans;
