import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Find from './pages/Find';
import Request from './pages/Request';
import RequestSent from './pages/RequestSent';
import MyLoans from './pages/MyLoans';
import LabOverview from './pages/LabOverview';
import Requests from './pages/Requests';
import Headsets from './pages/Headsets';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';


const RequireRole= ({ role, children }) => {
  const { user }  = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'technician' ? '/lab' : '/home'} replace />;
  return children;
};

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};


const student = (el) => <RequireRole role="student">{el}</RequireRole>;
const tech = (el) => <RequireRole role="technician">{el}</RequireRole>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={student(<Home />)} />
        <Route path ="/find" element={student(<Find />)} />
        <Route path="/request" element={student(<Request />)} />
        <Route path="/sent" element={student(<RequestSent />)} />
        <Route path ="/loans" element={student(<MyLoans />)} />
        <Route path="/lab" element={tech(<LabOverview />)} />
        <Route path="/requests" element={tech(<Requests />)} />
        <Route path ="/headsets" element={tech(<Headsets />)} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
