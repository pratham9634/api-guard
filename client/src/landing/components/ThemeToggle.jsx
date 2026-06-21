import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
                 bg-surface-card hover:bg-surface-card-hover border border-border
                 transition-all duration-200 cursor-pointer focus:outline-none
                 focus:ring-2 focus:ring-accent-primary/50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400" />
        ) : (
          <Moon size={18} className="text-indigo-500" />
        )}
      </motion.div>
    </button>
  );
}
