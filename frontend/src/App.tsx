import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import LicensesPage from './pages/LicensesPage';
import ActivationsPage from './pages/ActivationsPage';
import { ProductsPage, ModulesPage, LicenseTypesPage, VersionsPage } from './pages/CatalogPages';
import AuditPage from './pages/AuditPage';
import UsersPage from './pages/UsersPage';
import { UserRole } from './types';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="activations" element={<ActivationsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="license-types" element={<LicenseTypesPage />} />
          <Route path="versions" element={<VersionsPage />} />
          <Route element={<ProtectedRoute minRole={UserRole.ADMIN} />}>
            <Route path="audit" element={<AuditPage />} />
          </Route>
          <Route element={<ProtectedRoute minRole={UserRole.SUPER_ADMIN} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
