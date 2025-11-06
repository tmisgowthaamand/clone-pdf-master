import { FileText, Image, FileSpreadsheet, Presentation, File } from 'lucide-react';

export const FloatingImages = () => {
  const floatingItems = [
    { Icon: FileText, color: 'text-red-500', delay: '0s', position: { top: '15%', left: '10%' } },
    { Icon: Image, color: 'text-blue-500', delay: '2s', position: { top: '25%', right: '15%' } },
    { Icon: FileSpreadsheet, color: 'text-green-500', delay: '4s', position: { bottom: '20%', left: '15%' } },
    { Icon: Presentation, color: 'text-orange-500', delay: '1s', position: { top: '60%', right: '10%' } },
    { Icon: File, color: 'text-purple-500', delay: '3s', position: { bottom: '30%', right: '25%' } },
    { Icon: FileText, color: 'text-pink-500', delay: '5s', position: { top: '40%', left: '20%' } },
  ];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-5 overflow-hidden">
      {floatingItems.map((item, index) => (
        <div
          key={index}
          className="absolute animate-float-3d"
          style={{
            ...item.position,
            animationDelay: item.delay,
            animationDuration: `${8 + index * 2}s`,
          }}
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className={`absolute inset-0 ${item.color} opacity-20 blur-2xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-500`} />
            
            {/* Icon container with glass effect */}
            <div className="relative glass-card p-4 rounded-2xl hover:scale-110 transition-all duration-300 shadow-3d">
              <item.Icon className={`w-12 h-12 ${item.color} animate-pulse-3d`} />
            </div>

            {/* Orbiting dot */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-bounce" />
          </div>
        </div>
      ))}
    </div>
  );
};
