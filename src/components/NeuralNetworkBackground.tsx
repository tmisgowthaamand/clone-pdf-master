import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
  pulse: number;
  pulseSpeed: number;
}

export const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const nodesRef = useRef<Node[]>([]);
  const frameRef = useRef<number>();
  const signalsRef = useRef<Array<{ from: number; to: number; progress: number }>>([]);

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

    // Initialize neural network nodes
    const nodeCount = 50;
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      connections: [],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    // Create connections between nearby nodes
    nodesRef.current.forEach((node, i) => {
      nodesRef.current.forEach((otherNode, j) => {
        if (i !== j) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200 && node.connections.length < 4) {
            node.connections.push(j);
          }
        }
      });
    });

    // Initialize signals
    const createSignal = () => {
      const fromNode = Math.floor(Math.random() * nodesRef.current.length);
      const node = nodesRef.current[fromNode];
      if (node.connections.length > 0) {
        const toNode = node.connections[Math.floor(Math.random() * node.connections.length)];
        signalsRef.current.push({ from: fromNode, to: toNode, progress: 0 });
      }
    };

    // Create initial signals
    for (let i = 0; i < 5; i++) {
      createSignal();
    }

    // Periodically create new signals
    const signalInterval = setInterval(() => {
      if (signalsRef.current.length < 10) {
        createSignal();
      }
    }, 1000);

    const animate = () => {
      if (!ctx || !canvas) return;

      const isDark = theme === 'dark';
      
      // Clear with fade effect
      ctx.fillStyle = isDark 
        ? 'rgba(6, 0, 16, 0.1)' 
        : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Update pulse
        node.pulse += node.pulseSpeed;

        // Draw connections
        node.connections.forEach(targetIndex => {
          const target = nodesRef.current[targetIndex];
          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          
          if (isDark) {
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.2)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
          } else {
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
          }

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });

        // Draw node
        const pulseSize = 3 + Math.sin(node.pulse) * 2;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 3);
        
        if (isDark) {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
          gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.4)');
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
          gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.3)');
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = isDark ? 'rgba(147, 51, 234, 1)' : 'rgba(147, 51, 234, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw signals
      signalsRef.current = signalsRef.current.filter(signal => {
        signal.progress += 0.02;

        if (signal.progress >= 1) {
          return false; // Remove completed signals
        }

        const fromNode = nodesRef.current[signal.from];
        const toNode = nodesRef.current[signal.to];

        const x = fromNode.x + (toNode.x - fromNode.x) * signal.progress;
        const y = fromNode.y + (toNode.y - fromNode.y) * signal.progress;

        // Draw signal
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        if (isDark) {
          gradient.addColorStop(0, 'rgba(236, 72, 153, 1)');
          gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.5)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
          gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(signalInterval);
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
          ? 'radial-gradient(circle at 50% 50%, #0a0520 0%, #060010 100%)'
          : 'radial-gradient(circle at 50% 50%, #f8f9ff 0%, #ffffff 100%)',
      }}
    />
  );
};
