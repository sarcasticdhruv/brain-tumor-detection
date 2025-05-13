import React from 'react';
import { Moon, Sun} from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative ml-auto">
      {/* Modern switch with floating animation */}
      <button
        onClick={toggleTheme}
        className={`
          relative flex items-center justify-between w-14 h-7 rounded-full p-1 transition-all duration-300 ease-in-out
          ${isDarkMode ? 'bg-indigo-600' : 'bg-amber-100'} 
          shadow-lg hover:shadow-xl
        `}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {/* Track Icons */}
        <span className={`absolute left-1.5 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
          <Sun size={14} className="text-amber-500" />
        </span>
        <span className={`absolute right-1.5 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
          <Moon size={14} className="text-blue-100" />
        </span>

        {/* Animated Knob with Shadow and Glow */}
        <span 
          className={`
            absolute w-5 h-5 rounded-full shadow-md z-10 transition-all duration-300 ease-in-out
            ${isDarkMode ? 'translate-x-7 bg-blue-200' : 'translate-x-0 bg-white border border-amber-300'}
            flex items-center justify-center
          `}
        >
          {/* Inner Icon (hidden on mobile for cleaner look) */}
          <span className="hidden sm:block">
            {isDarkMode ? (
              <Moon size={10} className="text-indigo-600" />
            ) : (
              <Sun size={10} className="text-amber-500" />
            )}
          </span>
          
          {/* Subtle glow effect */}
          <span 
            className={`
              absolute w-full h-full rounded-full blur-sm -z-10 transition-opacity duration-300
              ${isDarkMode ? 'bg-blue-300 opacity-70' : 'bg-amber-200 opacity-60'}
            `}
          />
        </span>
      </button>
      
      {/* Optional: Tooltip on hover (only on desktop) */}
      <div className="absolute top-full mt-2 right-0 hidden md:group-hover:block">
        <div className={`
          text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap
          ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} 
        `}>
          Switch to {isDarkMode ? 'light' : 'dark'} mode
        </div>
      </div>
    </div>
  );
}