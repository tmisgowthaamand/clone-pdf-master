/**
 * API Client with CORS support and retry logic for Render free tier cold starts
 */

interface FetchWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, maxRetries: number) => void;
  timeout?: number;
}

/**
 * Fetch with automatic retry logic for cold starts and CORS errors
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 5,
    retryDelay = 10000, // 10 seconds for cold starts
    onRetry,
    timeout = 120000, // 2 minutes timeout
  } = retryOptions;

  // Ensure CORS mode is set
  const fetchOptions: RequestInit = {
    ...options,
    mode: 'cors',
    headers: {
      ...options.headers,
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 502 Bad Gateway (backend sleeping)
      if (response.status === 502 && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, maxRetries);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry
      }

      // Handle 504 Gateway Timeout (backend starting up)
      if (response.status === 504 && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, maxRetries);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry
      }

      return response;
    } catch (error: any) {
      // Handle network errors and timeouts
      const isNetworkError = 
        error.name === 'AbortError' ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('CORS');

      if (isNetworkError && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, maxRetries);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry
      }

      // Final attempt failed
      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts: ${error.message || 'Network error'}`
        );
      }
    }
  }

  throw new Error('Unexpected error in fetchWithRetry');
}

/**
 * Convert file using backend API with retry logic
 */
export async function convertFile(
  endpoint: string,
  file: File,
  onProgress?: (message: string) => void
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithRetry(
    endpoint,
    {
      method: 'POST',
      body: formData,
    },
    {
      onRetry: (attempt, maxRetries) => {
        if (onProgress) {
          onProgress(
            `Backend is waking up... Attempt ${attempt}/${maxRetries}`
          );
        }
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: `Conversion failed (${response.status})` 
    }));
    throw new Error(error.error || `Conversion failed (${response.status})`);
  }

  return await response.blob();
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
