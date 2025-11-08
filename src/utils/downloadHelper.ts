/**
 * Download Helper Utility
 * Handles blob downloads with proper cleanup to prevent partition issues
 */

/**
 * Download a blob as a file with proper cleanup
 * Fixes Chrome's "Fetching Partitioned Blob URL Issue"
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create blob URL in the same partition
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  // Append to body to ensure same partition
  document.body.appendChild(a);
  
  // Trigger download
  a.click();
  
  // Clean up after a delay to prevent partition issues
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Create a preview URL for a file (e.g., PDF preview)
 * Returns the URL and a cleanup function
 */
export function createPreviewURL(file: File): { url: string; cleanup: () => void } {
  const url = URL.createObjectURL(file);
  
  return {
    url,
    cleanup: () => {
      URL.revokeObjectURL(url);
    }
  };
}

/**
 * Download from a response blob
 */
export async function downloadFromResponse(response: Response, filename: string): Promise<void> {
  const blob = await response.blob();
  downloadBlob(blob, filename);
}
