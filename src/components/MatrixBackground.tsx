import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

export const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    
    // Characters to use (mix of letters, numbers, and symbols)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';

    const animate = () => {
      if (!ctx || !canvas) return;

      const isDark = theme === 'dark';
      
      // Fade effect
      ctx.fillStyle = isDark 
        ? 'rgba(6, 0, 16, 0.05)' 
        : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;

        // Create gradient for each character
        const gradient = ctx.createLinearGradient(x, y * fontSize - fontSize, x, y * fontSize);
        
        if (isDark) {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 1)');
          gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.5)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
        } else {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
          gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.4)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.fillText(char, x, y * fontSize);

        // Reset drop randomly
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #060010 0%, #0a0520 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
      }}
    />
  );
};
