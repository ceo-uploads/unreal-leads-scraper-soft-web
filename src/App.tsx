import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Vault from './pages/Vault';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Login from './pages/Login';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020202] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500 selection:text-black">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
