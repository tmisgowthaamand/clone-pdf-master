import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to prevent forced reflows by caching element measurements
 */
export function useOptimizedLayout<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const rectCache = useRef<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Update cached measurements
  const updateMeasurements = useCallback(() => {
    if (elementRef.current) {
      rectCache.current = elementRef.current.getBoundingClientRect();
    }
  }, []);

  // Get cached rect (prevents forced reflow)
  const getRect = useCallback((): DOMRect | null => {
    if (!rectCache.current && elementRef.current) {
      rectCache.current = elementRef.current.getBoundingClientRect();
    }
    return rectCache.current;
  }, []);

  // Setup ResizeObserver for automatic cache updates
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial measurement
    updateMeasurements();

    // Use ResizeObserver for efficient resize detection
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        // Debounce updates
        requestAnimationFrame(updateMeasurements);
      });

      observer.observe(element);
      resizeObserverRef.current = observer;

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback to window resize
      const handleResize = () => updateMeasurements();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [updateMeasurements]);

  return { elementRef, getRect, updateMeasurements };
}

/**
 * Hook to batch DOM operations and prevent layout thrashing
 */
export function useBatchedUpdates() {
  const readQueue = useRef<Array<() => void>>([]);
  const writeQueue = useRef<Array<() => void>>([]);
  const scheduled = useRef(false);

  const flush = useCallback(() => {
    // Execute all reads first
    const reads = readQueue.current.slice();
    readQueue.current = [];
    reads.forEach(fn => fn());

    // Then execute all writes
    const writes = writeQueue.current.slice();
    writeQueue.current = [];
    writes.forEach(fn => fn());

    scheduled.current = false;
  }, []);

  const schedule = useCallback(() => {
    if (!scheduled.current) {
      scheduled.current = true;
      requestAnimationFrame(flush);
    }
  }, [flush]);

  const read = useCallback((fn: () => void) => {
    readQueue.current.push(fn);
    schedule();
  }, [schedule]);

  const write = useCallback((fn: () => void) => {
    writeQueue.current.push(fn);
    schedule();
  }, [schedule]);

  return { read, write };
}

/**
 * Hook for optimized scroll handling
 */
export function useOptimizedScroll(
  callback: (scrollTop: number) => void,
  throttleMs: number = 16 // ~60fps
) {
  const lastScrollTime = useRef(0);
  const rafId = useRef<number>();

  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    if (now - lastScrollTime.current < throttleMs) {
      return;
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      callback(scrollTop);
      lastScrollTime.current = now;
    });
  }, [callback, throttleMs]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);
}

/**
 * Hook for optimized canvas operations
 */
export function useOptimizedCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const rectCache = useRef<DOMRect | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Get optimized context
    ctxRef.current = canvasRef.current.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });

    // Cache rect
    const updateRect = () => {
      if (canvasRef.current) {
        rectCache.current = canvasRef.current.getBoundingClientRect();
      }
    };

    updateRect();

    // Update on resize with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateRect, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [canvasRef]);

  const getCanvasRect = useCallback(() => {
    if (!rectCache.current && canvasRef.current) {
      rectCache.current = canvasRef.current.getBoundingClientRect();
    }
    return rectCache.current;
  }, [canvasRef]);

  return { ctx: ctxRef.current, getCanvasRect };
}
