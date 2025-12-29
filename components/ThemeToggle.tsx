import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize theme based on local storage
    const savedTheme = localStorage.getItem('theme');

    // Default to light unless explicitly set to dark
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-7 rounded-full bg-surfaceHighlight border border-border hover:border-textMuted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label="Toggle Theme"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isDark ? 'translate-x-5 bg-surface text-white' : 'translate-x-0 bg-white text-yellow-500'
          }`}
      >
        {isDark ? (
          <Moon size={12} fill="currentColor" className="text-accent" />
        ) : (
          <Sun size={12} fill="currentColor" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;