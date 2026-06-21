import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  KeyRound,
  Users,
  UserCircle,
  Shield,
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isSuperAdmin } = useAuth();

  const navItems = [
    { label: 'Overview', section: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { label: 'Management', section: true, requireRole: ROLES.SUPER_ADMIN },
    { to: '/clients', label: 'Clients', icon: Building2, requireRole: ROLES.SUPER_ADMIN },
    { to: '/users', label: 'Users', icon: Users },
    { label: 'Security', section: true },
    { to: '/api-keys', label: 'API Keys', icon: KeyRound },
    { label: 'Account', section: true },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.requireRole && user?.role !== item.requireRole) return false;
    return true;
  });

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`w-[260px] border-r border-border bg-surface-secondary flex flex-col fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
            <Shield size={20} />
          </div>
          <span className="font-bold text-lg accent-text">API Guard</span>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {filteredItems.map((item, idx) => {
            if (item.section) {
              return (
                <div
                  key={idx}
                  className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'accent-gradient text-white accent-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-card-hover'
                  }`
                }
                onClick={onClose}
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
