import { useEffect, useState } from 'react';

export const GhibliCharacterSVG = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Throttle mouse movement for better performance
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        rafId = 0;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const parallaxX = (mousePosition.x - window.innerWidth / 2) / 50;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) / 50;

  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 lg:bottom-10 lg:right-16 z-20 pointer-events-none hidden md:block"
      style={{
        transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        transition: 'transform 0.3s ease-out',
        willChange: 'transform',
      }}
    >
      <div className="relative animate-float w-[80px] sm:w-[90px] lg:w-[110px]">
        {/* Glow effect - Enhanced for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/40 dark:to-pink-400/40 rounded-full blur-2xl animate-pulse-3d" style={{ willChange: 'opacity' }} />
        
        {/* SVG Ghibli-style character */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="relative drop-shadow-2xl dark:drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]"
        >
          {/* Character body */}
          <ellipse cx="100" cy="120" rx="45" ry="55" fill="#FFE4E1" />
          
          {/* Head */}
          <circle cx="100" cy="70" r="40" fill="#FFE4E1" />
          
          {/* Hair */}
          <path
            d="M 60 70 Q 60 30, 100 30 Q 140 30, 140 70"
            fill="#8B4513"
            className="animate-float-slow"
          />
          <circle cx="75" cy="50" r="15" fill="#8B4513" />
          <circle cx="125" cy="50" r="15" fill="#8B4513" />
          
          {/* Eyes */}
          <ellipse cx="85" cy="70" rx="8" ry="12" fill="#000" className="animate-blink" />
          <ellipse cx="115" cy="70" rx="8" ry="12" fill="#000" className="animate-blink" />
          <circle cx="87" cy="68" r="3" fill="#fff" />
          <circle cx="117" cy="68" r="3" fill="#fff" />
          
          {/* Blush */}
          <ellipse cx="70" cy="80" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
          <ellipse cx="130" cy="80" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
          
          {/* Smile */}
          <path
            d="M 85 85 Q 100 95, 115 85"
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Arms */}
          <ellipse cx="55" cy="130" rx="12" ry="30" fill="#FFE4E1" transform="rotate(-20 55 130)" />
          <ellipse cx="145" cy="130" rx="12" ry="30" fill="#FFE4E1" transform="rotate(20 145 130)" />
          
          {/* Hands holding PDF */}
          <circle cx="50" cy="150" r="10" fill="#FFE4E1" />
          <circle cx="150" cy="150" r="10" fill="#FFE4E1" />
          
          {/* PDF Document */}
          <rect x="80" y="140" width="40" height="50" rx="3" fill="#fff" stroke="#9333EA" strokeWidth="2" />
          <line x1="85" y1="150" x2="115" y2="150" stroke="#9333EA" strokeWidth="2" />
          <line x1="85" y1="160" x2="115" y2="160" stroke="#9333EA" strokeWidth="2" />
          <line x1="85" y1="170" x2="110" y2="170" stroke="#9333EA" strokeWidth="2" />
          <text x="100" y="185" fontSize="10" fill="#9333EA" textAnchor="middle" fontWeight="bold">PDF</text>
        </svg>

        {/* Speech bubble - Extra Small */}
        <div className="absolute -top-10 sm:-top-11 lg:-top-12 -left-4 sm:-left-5 lg:-left-6 w-24 sm:w-28 lg:w-32 animate-fade-in z-30">
          <div className="relative bg-white dark:bg-gray-800 rounded-md lg:rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-lg border border-purple-300 dark:border-purple-700">
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-800 dark:text-gray-200 text-center font-semibold leading-tight">
              ✨ Help!
            </p>
            <div className="absolute -bottom-1 left-3 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white dark:bg-gray-800 border-r border-b border-purple-300 dark:border-purple-700 transform rotate-45" />
          </div>
        </div>

        {/* Sparkles */}
        <div className="absolute top-0 right-0 w-4 h-4 text-yellow-400 animate-ping">⭐</div>
        <div className="absolute bottom-10 left-0 w-3 h-3 text-pink-400 animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-10 left-10 w-3 h-3 text-purple-400 animate-ping" style={{ animationDelay: '1s' }}>💫</div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
        .animate-blink {
          animation: blink 4s infinite;
        }
      `}</style>
    </div>
  );
};
