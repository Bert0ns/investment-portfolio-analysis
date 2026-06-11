'use client';

import * as React from 'react';
import { Palette, Check, Briefcase } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CyberpunkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="square"
    strokeLinejoin="miter"
    {...props}
  >
    <path d="M12 2L2 12L12 22L22 12Z" />
    <path d="M12 2V22" />
    <path d="M2 12H22" />
    <path d="M6 8H18M6 16H18" className="text-primary" stroke="currentColor" />
  </svg>
);

const CartoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2C13.5 6.5 17.5 10.5 22 12C17.5 13.5 13.5 17.5 12 22C10.5 17.5 6.5 13.5 2 12C6.5 10.5 10.5 6.5 12 2Z" />
  </svg>
);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9 border-primary/50 hover:bg-primary/20 text-primary"
            title="Select Theme"
          />
        }
      >
        <Palette className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme('theme-cyberpunk')} className="justify-between">
          <div className="flex items-center gap-2">
            <CyberpunkIcon className="h-4 w-4" />
            <span>Cyberpunk</span>
          </div>
          {theme === 'theme-cyberpunk' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('theme-cartoon')} className="justify-between">
          <div className="flex items-center gap-2">
            <CartoonIcon className="h-4 w-4" />
            <span>Cartoon</span>
          </div>
          {theme === 'theme-cartoon' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('theme-professional')}
          className="justify-between"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Professional</span>
          </div>
          {theme === 'theme-professional' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
