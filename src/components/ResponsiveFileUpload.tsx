import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveFileUploadProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export const ResponsiveFileUpload = ({
  onFileSelect,
  acceptedFormats = ".pdf",
  icon,
  title = "Upload File",
  description = "Click or drag and drop your file here"
}: ResponsiveFileUploadProps) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Card - Responsive */}
      <div className="card-enhanced p-6 sm:p-8 lg:p-12 rounded-2xl text-center space-y-4 sm:space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-pulse-3d">
            {icon || <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Upload Area */}
        <label htmlFor="responsive-file-upload" className="block cursor-pointer group">
          <input
            id="responsive-file-upload"
            name="responsive-file-upload"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-6 sm:p-8 lg:p-12 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {description}
            </p>
            
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Supported formats: {acceptedFormats}
            </p>
          </div>
        </label>

        {/* Action Button */}
        <Button 
          size="lg" 
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 h-auto"
        >
          Select File
        </Button>

        {/* Info Text */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
          Your files are processed securely and deleted automatically
        </p>
      </div>

      {/* Features Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 lg:mt-12">
        <div className="card-enhanced p-4 sm:p-6 rounded-xl text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🔒</div>
          <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Secure</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Files encrypted & auto-deleted
          </p>
        </div>

        <div className="card-enhanced p-4 sm:p-6 rounded-xl text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">⚡</div>
          <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Fast</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Process files in seconds
          </p>
        </div>

        <div className="card-enhanced p-4 sm:p-6 rounded-xl text-center sm:col-span-2 lg:col-span-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">💯</div>
          <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Free</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            100% free, no limits
          </p>
        </div>
      </div>
    </div>
  );
};
