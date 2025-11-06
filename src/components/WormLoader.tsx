import React from 'react';

export const WormLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10">
      <div className="flex flex-col items-center gap-6">
        {/* Infinity Worm Loader */}
        <div className="relative w-32 h-32">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background infinity shape */}
            <path
              d="M 50,100 C 50,60 70,40 100,40 C 130,40 150,60 150,100 C 150,140 130,160 100,160 C 70,160 50,140 50,100 Z M 100,40 C 130,40 150,60 150,100 C 150,140 170,160 200,160 C 230,160 250,140 250,100 C 250,60 230,40 200,40 C 170,40 150,60 150,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className="text-gray-300 dark:text-gray-700"
              transform="translate(-50, 0) scale(0.8)"
            />
            
            {/* Animated gradient worm */}
            <path
              d="M 50,100 C 50,60 70,40 100,40 C 130,40 150,60 150,100 C 150,140 130,160 100,160 C 70,160 50,140 50,100 Z M 100,40 C 130,40 150,60 150,100 C 150,140 170,160 200,160 C 230,160 250,140 250,100 C 250,60 230,40 200,40 C 170,40 150,60 150,100"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset="0"
              transform="translate(-50, 0) scale(0.8)"
              className="animate-worm-loader"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading PDFTools
          </h2>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};
