import { useTheme } from '@/hooks/useTheme';

export const FloatingOrbs = () => {
  const { theme } = useTheme();
  
  const orbs = [
    { size: 400, top: '10%', left: '10%', delay: '0s', duration: '20s' },
    { size: 300, top: '60%', left: '80%', delay: '5s', duration: '25s' },
    { size: 350, top: '80%', left: '20%', delay: '10s', duration: '30s' },
  ];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, index) => (
        <div
          key={index}
          className="absolute rounded-full animate-float-slow"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            top: orb.top,
            left: orb.left,
            animationDelay: orb.delay,
            animationDuration: orb.duration,
            background: theme === 'dark'
              ? `radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)`
              : `radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}
    </div>
  );
};
