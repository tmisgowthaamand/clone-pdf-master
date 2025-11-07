import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dynamically load non-critical CSS after initial render
const loadNonCriticalCSS = () => {
  // Load animations CSS only when needed
  const animationsLink = document.createElement('link');
  animationsLink.rel = 'stylesheet';
  animationsLink.href = '/src/animations.css';
  animationsLink.media = 'print';
  animationsLink.onload = function() {
    (this as HTMLLinkElement).media = 'all';
  };
  document.head.appendChild(animationsLink);
};

// Defer non-critical tasks to reduce main-thread work
const deferNonCriticalTasks = () => {
  // Load non-critical CSS first
  loadNonCriticalCSS();
  // Use requestIdleCallback for non-critical work
  const scheduleTask = (task: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(task, { timeout: 2000 });
    } else {
      setTimeout(task, 1);
    }
  };

  // Register Service Worker (non-critical)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    scheduleTask(() => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }

  // Initialize Web Workers for heavy tasks (non-critical)
  scheduleTask(async () => {
    try {
      const { workerManager } = await import('./utils/workerManager');
      workerManager.initialize();
    } catch (error) {
      console.warn('Worker manager failed to load:', error);
    }
  });

  // Preload critical libraries (non-critical)
  scheduleTask(async () => {
    try {
      const { preloadCriticalLibraries } = await import('./utils/lazyImports');
      preloadCriticalLibraries();
    } catch (error) {
      console.warn('Failed to preload libraries:', error);
    }
  });

  // Preload critical routes (non-critical)
  scheduleTask(() => {
    // Preload most common routes
    const criticalRoutes = ['/pdf-to-jpg', '/merge-pdf', '/compress-pdf'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  });
};

// Render app immediately (critical)
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Defer non-critical tasks after initial render
if (document.readyState === 'complete') {
  deferNonCriticalTasks();
} else {
  window.addEventListener('load', deferNonCriticalTasks);
}
