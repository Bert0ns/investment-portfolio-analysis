'use client';

import * as React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === 'theme-cyberpunk') {
      setTheme('theme-cartoon');
    } else if (theme === 'theme-cartoon') {
      setTheme('theme-professional');
    } else {
      setTheme('theme-cyberpunk');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 border-primary/50 hover:bg-primary/20 text-primary"
      title="Toggle Theme"
    >
      <Palette className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
