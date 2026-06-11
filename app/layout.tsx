import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/Navbar';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ETF Portfolio Analyzer',
  description: 'Analyze and visualize your custom ETF portfolio.',
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-professional"
          themes={['theme-cyberpunk', 'theme-cartoon', 'theme-professional']}
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <TooltipProvider>
              <Navbar />
              {children}
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
