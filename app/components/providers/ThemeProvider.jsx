'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

// Create context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children }) {
  // Use theme from local storage if available, otherwise detect system preference
  const [theme, setTheme] = useState('light');
  const systemPrefersDark = useMediaQuery(
    { query: '(prefers-color-scheme: dark)' },
    undefined,
  );

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, [systemPrefersDark]);

  // Update data-theme attribute and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <style jsx global>{`
        :root {
          /* Light theme colors */
          --background: #ffffff;
          --foreground: #1f2937;
          --primary: #7c3aed;
          --primary-light: #a78bfa;
          --primary-dark: #6d28d9;
          --secondary: #f3f4f6;
          --secondary-light: #f9fafb;
          --secondary-dark: #e5e7eb;
          --neutral-dark: #4b5563;
          --neutral-medium: #9ca3af;
          --neutral-light: #e5e7eb;
          --error: #ef4444;
          --success: #10b981;
        }

        [data-theme='dark'] {
          /* Dark theme colors */
          --background: #1e1e2d;
          --foreground: #f3f4f6;
          --primary: #8b5cf6;
          --primary-light: #a78bfa;
          --primary-dark: #7c3aed;
          --secondary: #27293d;
          --secondary-light: #2d2d44;
          --secondary-dark: #1a1a2e;
          --neutral-dark: #9ca3af;
          --neutral-medium: #6b7280;
          --neutral-light: #374151;
          --error: #f87171;
          --success: #34d399;
        }

        body {
          background-color: var(--background);
          color: var(--foreground);
          transition: background-color 0.3s, color 0.3s;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider; 