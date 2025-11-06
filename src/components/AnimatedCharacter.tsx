import { useEffect, useState } from 'react';
import { FileText, Sparkles, Zap, Star } from 'lucide-react';

interface AnimatedCharacterProps {
  position?: 'left' | 'right' | 'center';
}

export const AnimatedCharacter = ({ position = 'right' }: AnimatedCharacterProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const positionClasses = {
    left: 'left-10 top-1/4',
    right: 'right-10 top-1/4',
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  // Calculate parallax effect
  const parallaxX = (mousePosition.x - window.innerWidth / 2) / 50;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) / 50;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-10 pointer-events-none`}
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Main Character Container */}
      <div className="relative w-64 h-64 animate-float">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-3d" />
        
        {/* Character Body */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {/* PDF Document Icon - 3D Effect */}
          <div className="relative transform-gpu perspective-container">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 animate-glow-pulse" />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-3d transform hover:scale-110 transition-all duration-500 card-3d">
              <FileText className="w-24 h-24 text-purple-600 dark:text-purple-400 animate-bounce-continuous" />
              
              {/* Floating Sparkles */}
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-spin-slow" />
              <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400 animate-bounce" />
              <Star className="absolute top-1/2 -right-6 w-6 h-6 text-pink-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Orbiting Elements */}
        <div className="absolute inset-0 animate-rotate-slow">
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-purple-500 rounded-full blur-sm" />
        </div>
        <div className="absolute inset-0 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '10s' }}>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-pink-500 rounded-full blur-sm" />
        </div>
      </div>
    </div>
  );
};
