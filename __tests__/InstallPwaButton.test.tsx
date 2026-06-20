import { render, screen, fireEvent, act } from '@testing-library/react';
import { InstallPwaButton } from '@/components/InstallPwaButton';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

describe('InstallPwaButton', () => {
  it('does not render if beforeinstallprompt is not fired', () => {
    render(
      <LanguageProvider>
        <InstallPwaButton />
      </LanguageProvider>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders and handles the prompt when beforeinstallprompt is fired', async () => {
    render(
      <LanguageProvider>
        <InstallPwaButton />
      </LanguageProvider>
    );

    // Mock the prompt method and userChoice promise
    const promptMock = jest.fn();
    const userChoiceMock = Promise.resolve({ outcome: 'accepted' });

    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: promptMock,
      userChoice: userChoiceMock,
      preventDefault: jest.fn(),
    });

    // Fire the event
    act(() => {
      window.dispatchEvent(event);
    });

    // The button should now be in the document
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Install App');

    // Click the button
    await act(async () => {
      fireEvent.click(button);
    });

    // It should call prompt()
    expect(promptMock).toHaveBeenCalled();
  });
});
