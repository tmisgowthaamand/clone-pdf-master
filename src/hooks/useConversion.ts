/**
 * Reusable conversion hook with retry logic and better error handling
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadWithRetry } from '@/utils/apiRetry';
import { downloadBlob } from '@/utils/downloadHelper';

interface ConversionOptions {
  endpoint: string;
  outputExtension: string;
  mimeType: string;
  estimatedTime?: string;
  successMessage?: string;
}

export function useConversion() {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);

  const convert = async (file: File, options: ConversionOptions) => {
    setIsConverting(true);

    try {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const estimatedTime = options.estimatedTime || 
        (file.size > 5 * 1024 * 1024 ? '1-2 minutes' : '30-45 seconds');
      
      console.log(`Starting conversion: ${file.name} (${fileSizeMB}MB)`);
      console.log(`Endpoint: ${options.endpoint}`);
      
      toast({
        title: "🚀 Converting...",
        description: `Processing ${file.name} (${fileSizeMB}MB). Estimated: ${estimatedTime}`,
      });

      const formData = new FormData();
      formData.append('file', file);
      
      // Use retry logic to handle cold starts
      const response = await uploadWithRetry(
        options.endpoint,
        formData,
        {
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt}/3:`, error.message);
            
            if (attempt === 1) {
              toast({
                title: "⏳ Server is waking up...",
                description: "Backend was sleeping (cold start). Retrying in 3 seconds...",
              });
            } else {
              toast({
                title: `🔄 Retry ${attempt}/3`,
                description: "Still waiting for server response...",
              });
            }
          },
        }
      );
      
      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Conversion failed' }));
        console.error('Conversion error:', error);
        throw new Error(error.error || 'Conversion failed');
      }

      // Download the converted file
      const blob = await response.blob();
      console.log('Blob received:', blob.size, 'bytes');
      
      // Generate output filename
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      const fileName = `${baseName}.${options.outputExtension}`;
      
      // Use download helper to prevent partition issues
      downloadBlob(blob, fileName);

      toast({
        title: "✅ Success!",
        description: options.successMessage || `File converted successfully!`,
      });

      return true;
    } catch (error: any) {
      console.error('Conversion error:', error);
      let errorMessage = "Conversion failed";
      
      if (error.name === 'AbortError') {
        errorMessage = "Server timeout after multiple retries. The backend may be overloaded or down.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Backend server is not responding after 3 retries. Please check if it's running.";
      } else if (error.status === 502) {
        errorMessage = "Backend server is down (502 Bad Gateway). It may be starting up - please try again in 30 seconds.";
      } else if (error.status === 503) {
        errorMessage = "Backend server is temporarily unavailable (503). Please try again in a minute.";
      } else if (error.status === 504) {
        errorMessage = "Gateway timeout (504). The conversion took too long. Try a smaller file.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsConverting(false);
    }
  };

  return { convert, isConverting };
}
