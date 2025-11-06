import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { WormLoader } from '@/components/ui/worm-loader';

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading screen after 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10">
      <div className="flex flex-col items-center gap-8">
        {/* Worm Loader Component - Large Size */}
        <div className="scale-[2.5] sm:scale-[3] md:scale-[3.5]">
          <WormLoader />
        </div>

        {/* Logo and Loading text */}
        <div className="text-center space-y-4 mt-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PDFTools
            </h2>
          </div>
          
          {/* Loading text */}
          <p className="text-base sm:text-lg text-muted-foreground font-medium">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
};
