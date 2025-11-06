import { useTheme } from '@/hooks/useTheme';
import { useEffect, useRef } from 'react';

export const GridBackground = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let offset = 0;
    const gridSize = 50;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated grid
      const isDark = theme === 'dark';
      ctx.strokeStyle = isDark 
        ? 'rgba(147, 51, 234, 0.1)' 
        : 'rgba(147, 51, 234, 0.05)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -gridSize + (offset % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = -gridSize + (offset % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw glowing dots at intersections
      ctx.fillStyle = isDark 
        ? 'rgba(147, 51, 234, 0.3)' 
        : 'rgba(147, 51, 234, 0.2)';
      
      for (let x = -gridSize + (offset % gridSize); x < canvas.width; x += gridSize) {
        for (let y = -gridSize + (offset % gridSize); y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      offset += 0.5;
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
    />
  );
};
