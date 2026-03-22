import { useState, useRef, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'svg-artist:panel-ratio';
const DEFAULT_RATIO = 0.5;
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

function clampRatio(ratio: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

function loadRatio(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) return clampRatio(parsed);
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_RATIO;
}

function saveRatio(ratio: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(ratio));
  } catch {
    // localStorage unavailable
  }
}

export function useResizablePanels() {
  const [ratio, setRatio] = useState(loadRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setRatio(DEFAULT_RATIO);
    saveRatio(DEFAULT_RATIO);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newRatio = clampRatio((e.clientX - rect.left) / rect.width);
        setRatio(newRatio);
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setRatio((current) => {
        saveRatio(current);
        return current;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const dividerProps = {
    className: 'pane-divider',
    onMouseDown: handleMouseDown,
    onDoubleClick: handleDoubleClick,
  };

  return { ratio, isDragging, dividerProps, containerRef };
}
