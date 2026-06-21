import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-surface-primary/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center">
        <button
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 md:hidden cursor-pointer focus:outline-none"
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <div className="text-sm font-semibold text-text-primary">{user?.username || 'User'}</div>
          <div className="text-xs text-text-tertiary capitalize">{ROLE_LABELS[user?.role] || user?.role}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center justify-center text-sm font-bold select-none">
          {getInitials(user?.username)}
        </div>
        <button
          className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
