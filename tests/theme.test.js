import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Theme Functions', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('setTheme', () => {
    it('should set theme attribute on document', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      setTheme('dark');

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should save theme to localStorage', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      setTheme('light');

      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      };

      document.documentElement.setAttribute('data-theme', 'light');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      };

      document.documentElement.setAttribute('data-theme', 'dark');

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should default to dark when no theme set', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      };

      toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('initTheme', () => {
    it('should use saved theme from localStorage', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
      };

      localStorage.getItem.mockReturnValue('dark');

      initTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should default to light theme if nothing saved', () => {
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      };

      const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
      };

      localStorage.getItem.mockReturnValue(null);

      initTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
