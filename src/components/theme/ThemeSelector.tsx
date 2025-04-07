'use client';

import React from 'react';
import { useTheme, ColorScheme } from './ThemeProvider';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { colorScheme, setColorScheme } = useTheme();

  const themes: { name: string; value: ColorScheme; color: string }[] = [
    { name: 'Light', value: 'light', color: '#ffffff' },
    { name: 'Dark', value: 'dark', color: '#1f2937' },
    { name: 'Blue', value: 'blue', color: '#eff6ff' },
    { name: 'Purple', value: 'purple', color: '#f5f3ff' },
    { name: 'Green', value: 'green', color: '#f0fdf4' },
    { name: 'Pink', value: 'pink', color: '#fdf2f8' },
  ];

  return (
    <div className={`theme-selector ${className}`}>
      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Color Scheme
      </div>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setColorScheme(theme.value)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${colorScheme === theme.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
            `}
            style={{
              backgroundColor: theme.color,
              borderColor: theme.value === 'light' ? '#e5e7eb' : theme.color,
            }}
            title={theme.name}
            aria-label={`Switch to ${theme.name} theme`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
