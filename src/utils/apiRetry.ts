/**
 * API Retry Utility - Handles cold starts and transient failures
 * Implements exponential backoff with configurable retry attempts
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 2000, // 2 seconds
  maxDelay: 60000, // 60 seconds for cold starts
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return true;
  }
  
  // HTTP status codes that are retryable
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  return false;
};

/**
 * Fetch with retry logic - handles cold starts gracefully
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // First attempt gets longer timeout for cold starts
      const timeoutDuration = attempt === 0 ? 90000 : 30000; // 90s first, then 30s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If response is ok, return it
      if (response.ok) {
        return response;
      }
      
      // Check if we should retry based on status
      if (!isRetryableError({ status: response.status })) {
        return response; // Don't retry 4xx errors (except 408, 429)
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      lastError.status = response.status;
      
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }
    }
    
    // Don't sleep after the last attempt
    if (attempt < config.maxRetries) {
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      
      config.onRetry(attempt + 1, lastError);
      await sleep(delay);
    }
  }
  
  // All retries exhausted
  throw lastError;
}

/**
 * Specialized fetch for file uploads with progress
 */
export async function uploadWithRetry(
  url: string,
  formData: FormData,
  options: {
    onProgress?: (attempt: number, total: number) => void;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<Response> {
  return fetchWithRetry(
    url,
    {
      method: 'POST',
      body: formData,
    },
    {
      maxRetries: 3,
      initialDelay: 3000, // 3 seconds for cold start
      maxDelay: 90000, // 90 seconds max wait
      onRetry: (attempt, error) => {
        options.onProgress?.(attempt, 3);
        options.onRetry?.(attempt, error);
      },
    }
  );
}

/**
 * Health check with retry - useful for warming up cold starts
 */
export async function healthCheckWithRetry(
  baseUrl: string,
  options: RetryOptions = {}
): Promise<boolean> {
  try {
    const response = await fetchWithRetry(
      `${baseUrl}/health`,
      { method: 'GET' },
      {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 30000,
        ...options,
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
