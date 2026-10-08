import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Shell from '../components/Shell';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { CARD, BTN_ALT, MUTED, TITLE, ERRBOX, PAGE } from '../components/ui';


const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/auth/profile')
      .then(({ data }) => setProfile(data))
      .catch((err) => {
        
        if (err.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError('Could not load your profile. Please try again.');
      });
    
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const rows = [
    { label: 'Name', value: profile?.name },
    { label: 'Email', value: profile?.email },
    { label: 'Role', value: profile?.role, capitalize: true },
  ];

  return (
    <Shell>
      <TopBar title="Profile" role={user?.role} />
      <div className={PAGE}>
        {error && <div className={ERRBOX} role="alert">{error}</div>}

        <div className={`${CARD} flex flex-col gap-3`}>
          <span className={TITLE}>My details</span>
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4">
              <span className={MUTED}>{r.label}</span>
              <span className={`text-black text-sm leading-[21px] text-right break-all ${r.capitalize ? 'capitalize' : ''}`}>
                {r.value || '...'}
              </span>
            </div>
          ))}
          
          <p className={MUTED}>Your role is set by the lab and cannot be changed here.</p>
        </div>

        <div className="flex-1" />
        <button type="button" onClick={handleLogout} className={BTN_ALT}>Log out</button>
      </div>
      <BottomNav />
    </Shell>
  );
};
export default Profile;