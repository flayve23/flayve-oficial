import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.tsx';
import Login from '@/pages/auth/Login.tsx';
import Signup from '@/pages/auth/Signup.tsx';
import ForgotPassword from '@/pages/auth/ForgotPassword.tsx';
import ResetPassword from '@/pages/auth/ResetPassword.tsx';
import DashboardLayout from '@/components/layout/DashboardLayout.tsx';
import StreamerDashboard from '@/pages/dashboard/StreamerDashboard.tsx';
import StreamerProfile from '@/pages/dashboard/StreamerProfile.tsx';
import CallPage from '@/pages/call/CallPage.tsx';
import KYCPage from '@/pages/dashboard/KYCPage.tsx';
import EarningsPage from '@/pages/dashboard/EarningsPage.tsx';
import ViewerDashboard from '@/pages/dashboard/ViewerDashboard.tsx';
import ViewerWallet from '@/pages/dashboard/ViewerWallet.tsx';
import AdminDashboard from '@/pages/admin/AdminDashboard.tsx';
import AdminLiveOps from '@/pages/admin/AdminLiveOps.tsx';
import AdminCommission from '@/pages/admin/AdminCommission.tsx';
import LandingPage from '@/pages/public/LandingPage.tsx';
import TermsPage from '@/pages/public/TermsPage.tsx';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-primary-500">Carregando...</div>;
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/live-ops" element={<PrivateRoute><AdminLiveOps /></PrivateRoute>} />
          <Route path="/admin/commission" element={<PrivateRoute><AdminCommission /></PrivateRoute>} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="streamer" element={<StreamerDashboard />} />
            <Route path="streamer/profile" element={<StreamerProfile />} />
            <Route path="streamer/kyc" element={<KYCPage />} />
            <Route path="streamer/earnings" element={<EarningsPage />} />
            <Route path="viewer" element={<ViewerDashboard />} />
            <Route path="viewer/wallet" element={<ViewerWallet />} />
            <Route path="call/:id" element={<CallPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
