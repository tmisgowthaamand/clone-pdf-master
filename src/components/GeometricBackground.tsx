import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface Shape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'triangle' | 'square' | 'hexagon' | 'circle';
  color: string;
  vx: number;
  vy: number;
}

export const GeometricBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const shapesRef = useRef<Shape[]>([]);
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

    const isDark = theme === 'dark';
    const colors = isDark
      ? ['rgba(147, 51, 234, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(236, 72, 153, 0.3)']
      : ['rgba(147, 51, 234, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(236, 72, 153, 0.15)'];

    // Initialize shapes
    shapesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 60,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      type: ['triangle', 'square', 'hexagon', 'circle'][Math.floor(Math.random() * 4)] as Shape['type'],
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const drawTriangle = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      ctx.restore();
    };

    const drawSquare = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.rect(-size, -size, size * 2, size * 2);
      ctx.closePath();
      ctx.restore();
    };

    const drawHexagon = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = size * Math.cos(angle);
        const hy = size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = isDark 
        ? 'rgba(6, 0, 16, 0.1)' 
        : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      shapesRef.current.forEach(shape => {
        // Update position
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.rotation += shape.rotationSpeed;

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        // Draw shape
        ctx.fillStyle = shape.color;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;

        switch (shape.type) {
          case 'triangle':
            drawTriangle(shape.x, shape.y, shape.size, shape.rotation);
            break;
          case 'square':
            drawSquare(shape.x, shape.y, shape.size, shape.rotation);
            break;
          case 'hexagon':
            drawHexagon(shape.x, shape.y, shape.size, shape.rotation);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
            ctx.closePath();
            break;
        }

        ctx.fill();
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
          ? 'linear-gradient(135deg, #060010 0%, #0a0520 50%, #060010 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #ffffff 100%)',
      }}
    />
  );
};
