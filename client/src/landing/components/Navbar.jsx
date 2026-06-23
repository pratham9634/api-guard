import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import RequestAccessModal from './RequestAccessModal';

const NAV_LINKS = [
  { label: 'Showcase', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Playground', href: '#playground' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar({ theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="glass-landing flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
              aria-label="API Guard Home"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary
                            flex items-center justify-center shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                API Guard
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-text-secondary
                           hover:text-text-primary transition-colors duration-200
                           rounded-lg hover:bg-surface-card/50"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => logout()}
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-text-secondary
                             hover:text-text-primary transition-colors duration-200 rounded-lg
                             hover:bg-surface-card/50 cursor-pointer focus:outline-none"
                  >
                    Log Out
                  </button>
                  <Link
                    to="/app/dashboard"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold
                             rounded-lg accent-gradient text-white accent-glow
                             hover:opacity-90 transition-opacity duration-200"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-text-secondary
                             hover:text-text-primary transition-colors duration-200 rounded-lg
                             hover:bg-surface-card/50"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold
                             rounded-lg accent-gradient text-white accent-glow
                             hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                  >
                    Request Access
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center
                         bg-surface-card hover:bg-surface-card-hover border border-border
                         transition-colors duration-200 cursor-pointer focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[88px] z-40 md:hidden"
          >
            <div className="mx-4 glass-landing p-4 flex flex-col gap-1 shadow-2xl">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-text-secondary
                           hover:text-text-primary hover:bg-surface-card/50
                           rounded-lg transition-colors duration-200 text-left"
                >
                  {link.label}
                </a>
              ))}
              <div className="section-divider my-2" />
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="px-4 py-3 text-sm font-medium text-text-secondary
                             hover:text-text-primary hover:bg-surface-card/50
                             rounded-lg transition-colors duration-200 text-left cursor-pointer focus:outline-none"
                  >
                    Log Out
                  </button>
                  <Link
                    to="/app/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="mt-1 px-4 py-3 text-sm font-semibold text-center
                             rounded-lg accent-gradient text-white accent-glow"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-text-secondary
                             hover:text-text-primary hover:bg-surface-card/50
                             rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => {
                      setShowRequestModal(true);
                      setMobileOpen(false);
                    }}
                    className="mt-1 px-4 py-3 text-sm font-semibold text-center
                             rounded-lg accent-gradient text-white accent-glow cursor-pointer focus:outline-none"
                  >
                    Request Access
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RequestAccessModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
      />
    </>
  );
}
