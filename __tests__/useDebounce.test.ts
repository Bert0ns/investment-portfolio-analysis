import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces the value change', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial immediately after update
    expect(result.current).toBe('initial');

    // Fast-forward half the delay
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated');
  });
});
