import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n/LanguageContext';

// Mock dependencies
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
jest.mock('next/image', () => ({
  __esModule: true,

  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={props.alt || 'mocked image'} {...props} />
  ),
}));
jest.mock('../components/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));
jest.mock('../components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));
jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: jest.fn(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: {
        navbar: {
          dashboard: 'Dashboard',
          about: 'About',
          github: 'GitHub',
          menu: 'Menu',
          language: 'Language',
          theme: 'Theme',
        },
      },
    });
  });

  it('renders desktop navigation links', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GitHub').length).toBeGreaterThan(0);
  });

  it('renders theme and language switchers', () => {
    render(<Navbar />);
    expect(screen.getAllByTestId('theme-switcher').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('language-switcher').length).toBeGreaterThan(0);
  });
});
