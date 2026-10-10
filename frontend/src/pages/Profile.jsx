import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Shell from '../components/Shell';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { CARD, FIELD, FIELD_E, BTN, BTN_ALT, MUTED, TITLE, ERRBOX, OKBOX, PAGE } from '../components/ui';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };


const LABEL = 'text-black text-sm font-medium leading-[21px]';
const FIELD_ERROR = 'text-[#9c2e26] text-sm leading-[21px]';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };


  const changePassword = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setPasswordErrors({});
    try {
      await axiosInstance.put('/api/auth/password', passwords);
      setPasswords(EMPTY_PASSWORDS);
      setNotice('Your password has been changed.');
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 400 && data?.errors) {
        setPasswordErrors(data.errors);
      } else if (err.response?.status === 401) {
        setPasswordErrors({ currentPassword: data?.message || 'Your old password is not right' });
      } else {
        setError(data?.message || 'Could not change your password. Please try again.');
      }
    }
  };

  const passwordFields = [
    { name: 'currentPassword', label: 'Old password', autoComplete: 'current-password' },
    { name: 'newPassword', label: 'New password', autoComplete: 'new-password', hint: 'At least 8 characters' },
    { name: 'confirmPassword', label: 'Repeat new password', autoComplete: 'new-password' },
  ];

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
        {notice && <div className={OKBOX} role="status">{notice}</div>}

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

        <form onSubmit={changePassword} noValidate className={`${CARD} flex flex-col gap-4`}>
          <span className={TITLE}>Change password</span>
          {passwordFields.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label htmlFor={f.name} className={LABEL}>{f.label}</label>
              <input id={f.name} type="password" placeholder={f.hint || ''} autoComplete={f.autoComplete}
                className={passwordErrors[f.name] ? FIELD_E : FIELD}
                value={passwords[f.name]}
                onChange={(e) => setPasswords({ ...passwords, [f.name]: e.target.value })} />
              {passwordErrors[f.name] && (
                <span className={FIELD_ERROR} role="alert">{passwordErrors[f.name]}</span>
              )}
            </div>
          ))}
          <button type="submit" className={BTN}>Change password</button>
        </form>

        <div className="flex-1" />
        <button type="button" onClick={handleLogout} className={BTN_ALT}>Log out</button>
      </div>
      <BottomNav />
    </Shell>
  );
};
export default Profile;