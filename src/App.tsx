import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Toaster } from 'sonner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { PendingApproval, Blocked, Unauthorized } from './pages/StatusPages';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" theme="dark" richColors />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/blocked" element={<Blocked />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute allowedRoles={['admin', 'supplier']}>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/catalog" element={
            <ProtectedRoute allowedRoles={['admin', 'retailer']}>
              <DashboardLayout>
                <Catalog />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['admin', 'supplier', 'retailer']}>
              <DashboardLayout>
                <Orders />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/deliveries" element={
            <ProtectedRoute allowedRoles={['admin', 'driver']}>
              <DashboardLayout>
                <Deliveries />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
