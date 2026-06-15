import { useEffect } from 'react';
import { CAMERA_STORAGE_KEY, CLEAR_UI_EVENT } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCameraPersistence(fgRef: React.MutableRefObject<any>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(CAMERA_STORAGE_KEY);
        if (stored && fgRef.current) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.x === 'number') {
            fgRef.current.cameraPosition(parsed, undefined, 2000);
          }
        }
      } catch (e) {
        console.warn('Could not restore camera position for camera_network_graph', e);
      }
    }, 100);

    const savePosition = () => {
      try {
        if (fgRef.current) {
          const pos = fgRef.current.cameraPosition();
          window.localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(pos));
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(savePosition, 1000);
    window.addEventListener('beforeunload', savePosition);

    const handleClear = () => {
      window.localStorage.removeItem(CAMERA_STORAGE_KEY);
    };

    window.addEventListener(CLEAR_UI_EVENT, handleClear);

    return () => {
      clearTimeout(timer);
      savePosition();
      clearInterval(interval);
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener(CLEAR_UI_EVENT, handleClear);
    };
  }, [fgRef]);
}
