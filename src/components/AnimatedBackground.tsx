import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
}

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with theme-based background
      const isDark = theme === 'dark';
      ctx.fillStyle = isDark 
        ? 'rgba(6, 0, 16, 0.1)' 
        : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx -= (dx / distance) * force * 0.2;
          particle.vy -= (dy / distance) * force * 0.2;
        }

        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        particle.vz *= 0.99;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0) particle.z = 1000;
        if (particle.z > 1000) particle.z = 0;

        // Calculate 3D projection
        const scale = 1000 / (1000 + particle.z);
        const x2d = particle.x * scale + canvas.width / 2 * (1 - scale);
        const y2d = particle.y * scale + canvas.height / 2 * (1 - scale);
        const size = particle.size * scale;

        // Draw particle
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
        
        if (isDark) {
          // Dark theme colors - purple/blue gradient
          gradient.addColorStop(0, `rgba(147, 51, 234, ${particle.opacity * scale})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${particle.opacity * scale * 0.5})`);
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
        } else {
          // Light theme colors - softer purple/pink gradient
          gradient.addColorStop(0, `rgba(147, 51, 234, ${particle.opacity * scale * 0.6})`);
          gradient.addColorStop(0.5, `rgba(236, 72, 153, ${particle.opacity * scale * 0.3})`);
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i >= j) return;

          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const dz = particle.z - otherParticle.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.2;
            const scale2 = 1000 / (1000 + otherParticle.z);
            const x2d2 = otherParticle.x * scale2 + canvas.width / 2 * (1 - scale2);
            const y2d2 = otherParticle.y * scale2 + canvas.height / 2 * (1 - scale2);

            ctx.strokeStyle = isDark
              ? `rgba(147, 51, 234, ${opacity})`
              : `rgba(147, 51, 234, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(x2d2, y2d2);
            ctx.stroke();
          }
        });
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
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
