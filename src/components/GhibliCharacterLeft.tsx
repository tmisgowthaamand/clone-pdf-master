import { useEffect, useState } from 'react';

export const GhibliCharacterLeft = () => {
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

  const parallaxX = (mousePosition.x - window.innerWidth / 2) / 60;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) / 60;

  return (
    <div 
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-8 lg:bottom-10 lg:left-16 z-20 pointer-events-none hidden md:block"
      style={{
        transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        transition: 'transform 0.3s ease-out',
        willChange: 'transform',
      }}
    >
      <div className="relative animate-float-slow w-[80px] sm:w-[90px] lg:w-[110px]">
        {/* Glow effect - Enhanced for dark mode with green theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/40 dark:to-emerald-400/40 rounded-full blur-2xl animate-pulse-3d" style={{ willChange: 'opacity' }} />
        
        {/* SVG Ghibli-style character - Totoro-inspired Forest Spirit */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="relative drop-shadow-2xl dark:drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        >
          {/* Body - Totoro style */}
          <ellipse cx="100" cy="130" rx="55" ry="60" fill="#7FB069" />
          
          {/* Belly */}
          <ellipse cx="100" cy="140" rx="40" ry="45" fill="#C8E6C9" />
          <path d="M 70 120 Q 100 140, 130 120" stroke="#A5D6A7" strokeWidth="2" fill="none" />
          <path d="M 70 135 Q 100 155, 130 135" stroke="#A5D6A7" strokeWidth="2" fill="none" />
          <path d="M 75 150 Q 100 165, 125 150" stroke="#A5D6A7" strokeWidth="2" fill="none" />
          
          {/* Head */}
          <circle cx="100" cy="75" r="42" fill="#7FB069" />
          
          {/* Ears - Pointed like Totoro */}
          <path d="M 65 50 L 55 15 L 75 40 Z" fill="#7FB069" stroke="#5A8C4F" strokeWidth="2" />
          <path d="M 135 50 L 145 15 L 125 40 Z" fill="#7FB069" stroke="#5A8C4F" strokeWidth="2" />
          
          {/* Eyes - Big round Totoro style */}
          <circle cx="80" cy="70" r="14" fill="#000" className="animate-blink" />
          <circle cx="120" cy="70" r="14" fill="#000" className="animate-blink" />
          <circle cx="83" cy="67" r="6" fill="#fff" />
          <circle cx="123" cy="67" r="6" fill="#fff" />
          <circle cx="85" cy="65" r="3" fill="#fff" />
          <circle cx="125" cy="65" r="3" fill="#fff" />
          
          {/* Nose - Triangle */}
          <path d="M 100 80 L 92 88 L 108 88 Z" fill="#5A8C4F" />
          
          {/* Whiskers */}
          <line x1="45" y1="75" x2="65" y2="73" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="45" y1="82" x2="65" y2="82" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="45" y1="89" x2="65" y2="91" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="155" y1="75" x2="135" y2="73" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="155" y1="82" x2="135" y2="82" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="155" y1="89" x2="135" y2="91" stroke="#5A8C4F" strokeWidth="2" />
          
          {/* Smile */}
          <path d="M 85 92 Q 100 100, 115 92" stroke="#5A8C4F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          {/* Arms */}
          <ellipse cx="50" cy="120" rx="18" ry="35" fill="#7FB069" transform="rotate(-15 50 120)" />
          <ellipse cx="150" cy="120" rx="18" ry="35" fill="#7FB069" transform="rotate(15 150 120)" />
          
          {/* Feet */}
          <ellipse cx="80" cy="180" rx="20" ry="15" fill="#7FB069" />
          <ellipse cx="120" cy="180" rx="20" ry="15" fill="#7FB069" />
          
          {/* Claws on feet */}
          <line x1="72" y1="185" x2="72" y2="190" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="80" y1="185" x2="80" y2="192" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="88" y1="185" x2="88" y2="190" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="112" y1="185" x2="112" y2="190" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="120" y1="185" x2="120" y2="192" stroke="#5A8C4F" strokeWidth="2" />
          <line x1="128" y1="185" x2="128" y2="190" stroke="#5A8C4F" strokeWidth="2" />
          
          {/* Leaf on head */}
          <path d="M 100 35 Q 95 25, 100 20 Q 105 25, 100 35" fill="#81C784" stroke="#5A8C4F" strokeWidth="1.5" className="animate-wiggle" />
        </svg>

        {/* Speech bubble - Extra Small */}
        <div className="absolute -top-10 sm:-top-11 lg:-top-12 -right-4 sm:-right-5 lg:-right-6 w-24 sm:w-28 lg:w-32 animate-fade-in z-30">
          <div className="relative bg-white dark:bg-gray-800 rounded-md lg:rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-lg border border-green-300 dark:border-green-700">
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-800 dark:text-gray-200 text-center font-semibold leading-tight">
              🌿 Organize!
            </p>
            <div className="absolute -bottom-1 right-3 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white dark:bg-gray-800 border-r border-b border-green-300 dark:border-green-700 transform rotate-45" />
          </div>
        </div>

        {/* Sparkles */}
        <div className="absolute top-5 left-5 w-4 h-4 text-green-400 animate-ping">🍃</div>
        <div className="absolute bottom-20 right-5 w-3 h-3 text-emerald-400 animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-20 right-10 w-3 h-3 text-lime-400 animate-ping" style={{ animationDelay: '1s' }}>🌟</div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-0 animate-float" style={{ animationDelay: '0.5s' }}>
          <svg width="30" height="30" viewBox="0 0 30 30">
            <rect x="5" y="5" width="20" height="25" rx="2" fill="#60A5FA" opacity="0.6" />
            <line x1="8" y1="10" x2="22" y2="10" stroke="#fff" strokeWidth="1" />
            <line x1="8" y1="15" x2="22" y2="15" stroke="#fff" strokeWidth="1" />
            <line x1="8" y1="20" x2="18" y2="20" stroke="#fff" strokeWidth="1" />
          </svg>
        </div>
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
          animation: blink 5s infinite;
        }
      `}</style>
    </div>
  );
};
