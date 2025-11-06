import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 sm:w-6 sm:h-6">
        <Sun
          className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 transition-all duration-500 ${
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 text-purple-400 transition-all duration-500 ${
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
};
