import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
}

export const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>();

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

    // Initialize stars
    const starCount = 200;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width,
      size: Math.random() * 2,
    }));

    const animate = () => {
      if (!ctx || !canvas) return;

      const isDark = theme === 'dark';
      
      // Clear with trail effect
      ctx.fillStyle = isDark 
        ? 'rgba(6, 0, 16, 0.2)' 
        : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      starsRef.current.forEach(star => {
        // Move star towards viewer
        star.z -= 5;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.z = canvas.width;
        }

        // Calculate 2D position
        const scale = canvas.width / star.z;
        const x2d = centerX + star.x * scale;
        const y2d = centerY + star.y * scale;

        // Calculate size based on depth
        const size = (1 - star.z / canvas.width) * star.size * 3;

        // Skip if outside canvas
        if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height) {
          return;
        }

        // Draw star with glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
        
        if (isDark) {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 1)');
          gradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.5)');
          gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
          gradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.4)');
          gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw star trail
        const prevZ = star.z + 5;
        const prevScale = canvas.width / prevZ;
        const prevX = centerX + star.x * prevScale;
        const prevY = centerY + star.y * prevScale;

        ctx.strokeStyle = isDark 
          ? 'rgba(147, 51, 234, 0.3)' 
          : 'rgba(147, 51, 234, 0.15)';
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x2d, y2d);
        ctx.stroke();
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        background: theme === 'dark'
          ? 'radial-gradient(ellipse at center, #0a0520 0%, #060010 100%)'
          : 'radial-gradient(ellipse at center, #f8f9ff 0%, #ffffff 100%)',
      }}
    />
  );
};
