import { useTheme } from '@/hooks/useTheme';

export const WaveAnimation = () => {
  const { theme } = useTheme();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none z-0 overflow-hidden">
      {/* Wave 1 */}
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          animation: 'wave 10s ease-in-out infinite',
        }}
      >
        <path
          fill={theme === 'dark' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)'}
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Wave 2 */}
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          animation: 'wave 15s ease-in-out infinite reverse',
        }}
      >
        <path
          fill={theme === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)'}
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Wave 3 */}
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          animation: 'wave 20s ease-in-out infinite',
        }}
      >
        <path
          fill={theme === 'dark' ? 'rgba(236, 72, 153, 0.06)' : 'rgba(236, 72, 153, 0.03)'}
          d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,202.7C672,224,768,256,864,245.3C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-25px) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};
