import { useEffect, useState } from 'react';

export const GhibliCharacter = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate parallax effect
  const parallaxX = (mousePosition.x - window.innerWidth / 2) / 30;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) / 30;

  return (
    <div 
      className="fixed bottom-10 right-10 z-20 pointer-events-none"
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div className="relative animate-float">
        {/* Ghibli-style character illustration */}
        <div className="relative w-64 h-64">
          {/* Shadow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/10 rounded-full blur-md" />
          
          {/* Character container with glow */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse-3d" />
            
            {/* Ghibli-style character illustration - Cute anime style */}
            <img
              src="https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&h=400&fit=crop&q=80"
              alt="Ghibli Character Helper"
              className="relative w-full h-full object-contain drop-shadow-2xl animate-bounce-continuous rounded-full"
              style={{ animationDuration: '3s' }}
              onError={(e) => {
                // Fallback to a different image if the first one fails
                e.currentTarget.src = "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=400&h=400&fit=crop&q=80";
              }}
            />
            
            {/* Sparkles around character */}
            <div className="absolute top-8 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-16 left-8 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 right-12 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            
            {/* Floating hearts */}
            <div className="absolute top-12 left-12 animate-float-slow">
              <svg className="w-6 h-6 text-pink-400 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Speech bubble */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 animate-fade-in">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
              ✨ Let me help you with PDFs!
            </p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-purple-200 dark:border-purple-800 transform rotate-45" />
          </div>
        </div>

        {/* Magical particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
