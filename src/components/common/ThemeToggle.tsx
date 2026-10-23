import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import toast from 'react-hot-toast';

interface ThemeToggleProps {
  variant?: 'desktop' | 'mobile' | 'compact';
  className?: string;
  onThemeSelect?: (theme: Theme) => void;
}

export default function ThemeToggle({
  variant = 'desktop',
  className = '',
  onThemeSelect,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleSelect = (selected: Theme) => {
    setTheme(selected);
    setDropdownOpen(false);
    if (onThemeSelect) onThemeSelect(selected);

    if (selected === 'system') {
      toast.success('System theme enabled — automatically adapting to your device', {
        id: 'theme-toast',
        icon: '💻',
      });
    } else if (selected === 'dark') {
      toast.success('Dark theme enabled', {
        id: 'theme-toast',
        icon: '🌙',
      });
    } else {
      toast.success('Light (Cream) theme enabled', {
        id: 'theme-toast',
        icon: '☀️',
      });
    }
  };

  const handleCycle = () => {
    const next = toggleTheme();
    if (onThemeSelect) onThemeSelect(next);

    if (next === 'system') {
      toast.success('System theme enabled — automatically adapting to your device', {
        id: 'theme-toast',
        icon: '💻',
      });
    } else if (next === 'dark') {
      toast.success('Dark theme enabled', {
        id: 'theme-toast',
        icon: '🌙',
      });
    } else {
      toast.success('Light (Cream) theme enabled', {
        id: 'theme-toast',
        icon: '☀️',
      });
    }
  };

  // --- MOBILE SEGMENTED CONTROL ---
  if (variant === 'mobile') {
    return (
      <div className={`space-y-1.5 w-full ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-amber-100/90 px-1">
          <span>Theme Appearance</span>
          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-[#302219] px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-[#594337]">
            {theme === 'system'
              ? `Auto (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`
              : theme === 'dark'
              ? 'Dark'
              : 'Cream'}
          </span>
        </div>
        <div
          role="group"
          aria-label="Theme selection"
          className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-[#20150F] rounded-xl border border-gray-200 dark:border-[#422B1E]"
        >
          <button
            type="button"
            onClick={() => handleSelect('cream')}
            aria-pressed={theme === 'cream'}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              theme === 'cream'
                ? 'bg-white dark:bg-[#302219] text-gray-900 dark:text-amber-100 shadow-xs border border-gray-200 dark:border-[#594337]'
                : 'text-gray-600 dark:text-amber-100/60 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sun size={14} className="text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('dark')}
            aria-pressed={theme === 'dark'}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-white dark:bg-[#302219] text-gray-900 dark:text-amber-100 shadow-xs border border-gray-200 dark:border-[#594337]'
                : 'text-gray-600 dark:text-amber-100/60 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Moon size={14} className="text-amber-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('system')}
            aria-pressed={theme === 'system'}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-white dark:bg-[#302219] text-gray-900 dark:text-amber-100 shadow-xs border border-gray-200 dark:border-[#594337]'
                : 'text-gray-600 dark:text-amber-100/60 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Monitor size={14} className="text-blue-500 dark:text-blue-400" />
            <span>System</span>
          </button>
        </div>
      </div>
    );
  }

  // --- COMPACT ICON-ONLY BUTTON (Cycle on click) ---
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCycle}
        className={`p-1.5 rounded-lg hover:bg-white/10 text-amber-100 transition-colors flex items-center relative min-w-[36px] min-h-[36px] justify-center cursor-pointer ${className}`}
        title={`Theme: ${theme === 'system' ? 'System (Auto)' : theme === 'dark' ? 'Dark' : 'Light'} (Click to cycle)`}
        aria-label={`Toggle theme (currently ${theme})`}
      >
        {theme === 'system' ? (
          <div className="relative">
            <Monitor size={17} className="text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
          </div>
        ) : resolvedTheme === 'dark' ? (
          <Moon size={17} className="text-[#FFD814]" />
        ) : (
          <Sun size={17} className="text-[#F59E0B]" />
        )}
      </button>
    );
  }

  // --- DESKTOP NAVBAR COMBO BUTTON + DROPDOWN ---
  const currentTitle =
    theme === 'system'
      ? `System Theme: Auto-adapts to your device (currently ${resolvedTheme})`
      : theme === 'dark'
      ? 'Dark Mode: Midnight espresso & warm gold'
      : 'Light Theme: Cream & warm chocolate';

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Quick-Cycle Toggle Button */}
      <button
        type="button"
        onClick={handleCycle}
        className="p-1.5 rounded-l-lg hover:bg-gray-100 dark:hover:bg-[#2B1B13] text-gray-700 dark:text-amber-100/80 transition-colors flex items-center relative min-w-[36px] min-h-[38px] justify-center cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-[#422B1E]"
        title={`${currentTitle} — Click to switch`}
        aria-label={`Toggle theme appearance (currently ${theme})`}
      >
        {theme === 'system' ? (
          <div className="relative">
            <Monitor size={18} className="text-blue-600 dark:text-amber-300" />
            <span
              className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#17110F]"
              title="System auto-sync active"
            />
          </div>
        ) : resolvedTheme === 'dark' ? (
          <Moon size={18} className="text-[#FFD814]" />
        ) : (
          <Sun size={18} className="text-[#F59E0B]" />
        )}
      </button>

      {/* Dropdown Chevron */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="p-1 rounded-r-lg hover:bg-gray-100 dark:hover:bg-[#2B1B13] text-gray-500 dark:text-amber-200/70 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center min-h-[38px] cursor-pointer border-l border-gray-200/60 dark:border-[#422B1E]"
        title="Choose theme appearance"
        aria-label="Theme options"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Accessible Dropdown Menu */}
      {dropdownOpen && (
        <div
          role="menu"
          aria-label="Theme appearance options"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-[#241914] border border-gray-200 dark:border-[#594337] shadow-xl p-2 z-50 animate-fadeIn"
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-gray-100 dark:border-[#38261C]">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-gray-400 dark:text-amber-200/60">
              Appearance Theme
            </span>
          </div>

          {/* Option: Light (Cream) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('cream')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
              theme === 'cream'
                ? 'bg-amber-50 dark:bg-[#34241B] text-amber-950 dark:text-amber-100 font-bold'
                : 'text-gray-700 dark:text-amber-100/70 hover:bg-gray-50 dark:hover:bg-[#2B1B13]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100/70 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sun size={15} />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Light (Cream)</div>
                <div className="text-[10px] text-gray-500 dark:text-amber-200/50">
                  Warm artisanal pastry tones
                </div>
              </div>
            </div>
            {theme === 'cream' && <Check size={14} className="text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Option: Dark */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('dark')}
            className={`w-full flex items-center justify-between p-2 mt-1 rounded-xl text-left transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-amber-50 dark:bg-[#34241B] text-amber-950 dark:text-amber-100 font-bold'
                : 'text-gray-700 dark:text-amber-100/70 hover:bg-gray-50 dark:hover:bg-[#2B1B13]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100/70 dark:bg-[#3E291E] flex items-center justify-center text-amber-500">
                <Moon size={15} />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Dark Mode</div>
                <div className="text-[10px] text-gray-500 dark:text-amber-200/50">
                  Midnight espresso & gold
                </div>
              </div>
            </div>
            {theme === 'dark' && <Check size={14} className="text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Option: System (Auto) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('system')}
            className={`w-full flex items-center justify-between p-2 mt-1 rounded-xl text-left transition-colors cursor-pointer ${
              theme === 'system'
                ? 'bg-amber-50 dark:bg-[#34241B] text-amber-950 dark:text-amber-100 font-bold'
                : 'text-gray-700 dark:text-amber-100/70 hover:bg-gray-50 dark:hover:bg-[#2B1B13]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100/70 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Monitor size={15} />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>System Theme</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono uppercase">
                    Auto
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 dark:text-amber-200/50">
                  Adapts to device ({resolvedTheme})
                </div>
              </div>
            </div>
            {theme === 'system' && (
              <Check size={14} className="text-amber-600 dark:text-amber-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
