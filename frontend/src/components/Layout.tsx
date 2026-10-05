import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Key,
  Package,
  Puzzle,
  Layers,
  GitBranch,
  Activity,
  FileText,
  LogOut,
  Shield,
  Bell,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_LABELS } from '../types';
import { cn } from '../utils';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, role: UserRole.SUPPORT },
  { name: 'Clients', href: '/clients', icon: Users, role: UserRole.SUPPORT },
  { name: 'Licences', href: '/licenses', icon: Key, role: UserRole.SUPPORT },
  { name: 'Activations', href: '/activations', icon: Bell, role: UserRole.SUPPORT },
  { name: 'Produits', href: '/products', icon: Package, role: UserRole.SUPPORT },
  { name: 'Modules', href: '/modules', icon: Puzzle, role: UserRole.SUPPORT },
  { name: 'Types de licence', href: '/license-types', icon: Layers, role: UserRole.MODERATOR },
  { name: 'Versions', href: '/versions', icon: GitBranch, role: UserRole.MODERATOR },
  { name: 'Journal d\'audit', href: '/audit', icon: FileText, role: UserRole.ADMIN },
  { name: 'Utilisateurs', href: '/users', icon: Shield, role: UserRole.SUPER_ADMIN },
];

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {mobileNavOpen && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-gray-950/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-gray-900 text-white transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary-400" />
            <div>
              <h1 className="font-bold text-lg">License Platform</h1>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation
            .filter((item) => user?.role === UserRole.MODERATOR
              ? ['/', '/clients', '/licenses', '/activations'].includes(item.href)
              : hasRole(item.role))
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )
                }
                onClick={() => setMobileNavOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user && ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            aria-label="Ouvrir le menu"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-gray-900">License Platform</span>
        </div>
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
