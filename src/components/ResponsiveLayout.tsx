import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const ResponsiveLayout = ({ children, title, description }: ResponsiveLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                PDFTools
              </span>
            </Link>

            {/* Home Button */}
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 sm:gap-2 text-xs sm:text-sm hover:scale-105 transition-transform"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Page Title */}
        {title && (
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="border-t border-border/50 bg-gray-50 dark:bg-gray-900 mt-12 sm:mt-16 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                PDFTools
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">
              © 2025 PDFTools. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 px-4">
              Made with ❤️ for PDF enthusiasts worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
