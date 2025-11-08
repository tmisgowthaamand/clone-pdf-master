import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress browser extension errors that don't affect functionality
window.addEventListener('error', (event) => {
  if (event.message?.includes('message channel closed')) {
    event.preventDefault();
    console.debug('Suppressed browser extension error:', event.message);
  }
});

// Suppress unhandled promise rejections from browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault();
    console.debug('Suppressed browser extension promise rejection:', event.reason);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
