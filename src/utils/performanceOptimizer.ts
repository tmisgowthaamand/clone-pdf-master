/**
 * Performance Optimizer - Prevent Forced Reflows
 * Batches DOM reads and writes to avoid layout thrashing
 */

// Request Animation Frame helper
export const rafScheduler = {
  reads: [] as Array<() => void>,
  writes: [] as Array<() => void>,
  scheduled: false,

  // Schedule a DOM read operation
  read(fn: () => void) {
    this.reads.push(fn);
    this.schedule();
  },

  // Schedule a DOM write operation
  write(fn: () => void) {
    this.writes.push(fn);
    this.schedule();
  },

  // Execute batched operations
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      const reads = this.reads.slice();
      this.reads = [];
      reads.forEach(fn => fn());

      // Then execute all writes
      const writes = this.writes.slice();
      this.writes = [];
      writes.forEach(fn => fn());

      this.scheduled = false;
    });
  },
};

// Debounce helper for resize events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle helper for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Cache DOM measurements
const measurementCache = new Map<string, DOMRect>();

export function getCachedRect(element: HTMLElement, cacheKey: string): DOMRect {
  if (measurementCache.has(cacheKey)) {
    return measurementCache.get(cacheKey)!;
  }

  const rect = element.getBoundingClientRect();
  measurementCache.set(cacheKey, rect);

  // Clear cache on resize
  window.addEventListener('resize', () => measurementCache.clear(), { once: true });

  return rect;
}

// Optimize scroll performance
export function optimizeScroll(callback: () => void) {
  let ticking = false;

  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Intersection Observer helper for lazy loading
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, options);
}

// Prevent layout thrashing in loops
export function batchDOMOperations<T>(
  items: T[],
  readFn: (item: T) => void,
  writeFn: (item: T) => void
) {
  // First, read all measurements
  const measurements = items.map((item) => {
    readFn(item);
    return item;
  });

  // Then, apply all changes
  requestAnimationFrame(() => {
    measurements.forEach((item) => {
      writeFn(item);
    });
  });
}

// Optimize canvas operations
export function optimizeCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', {
    alpha: false, // Disable alpha for better performance
    desynchronized: true, // Allow async rendering
  });

  if (!ctx) return null;

  // Cache rect to avoid repeated getBoundingClientRect calls
  let cachedRect: DOMRect | null = null;
  let resizeTimeout: NodeJS.Timeout;

  const updateRect = () => {
    cachedRect = canvas.getBoundingClientRect();
  };

  // Update rect on resize with debounce
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateRect, 150);
  });

  updateRect();

  return {
    ctx,
    getRect: () => cachedRect || canvas.getBoundingClientRect(),
  };
}
