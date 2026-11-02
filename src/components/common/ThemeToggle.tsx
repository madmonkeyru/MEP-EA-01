import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-label="Modo oscuro"
      aria-checked={isDark}
      title={'Cambiar a modo ' + (isDark ? 'claro' : 'oscuro')}
      className={'theme-toggle ' + className}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-thumb" aria-hidden="true" />
      <Sun size={18} aria-hidden="true" />
      <Moon size={18} aria-hidden="true" />
    </button>
  );
}
