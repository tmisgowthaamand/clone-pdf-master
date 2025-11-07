/**
 * Lazy import utilities for heavy dependencies
 * Reduces initial bundle size by loading libraries on-demand
 */

// Lazy load PDF-lib (379 KB)
export const loadPDFLib = async () => {
  const { PDFDocument } = await import('pdf-lib');
  return { PDFDocument };
};

// Lazy load PDF.js (293 KB)
export const loadPDFJS = async () => {
  const pdfjs = await import('pdfjs-dist');
  return pdfjs;
};

// Lazy load jsPDF
export const loadJSPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return { jsPDF };
};

// Lazy load JSZip
export const loadJSZip = async () => {
  const JSZip = await import('jszip');
  return JSZip.default;
};

// Lazy load Supabase client
export const loadSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return { createClient };
};

// Preload critical libraries after initial render
export const preloadCriticalLibraries = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload most commonly used libraries
      import('pdf-lib');
      import('pdfjs-dist');
    }, { timeout: 2000 });
  }
};
