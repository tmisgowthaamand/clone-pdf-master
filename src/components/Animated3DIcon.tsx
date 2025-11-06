import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface Animated3DIconProps {
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  children?: ReactNode;
}

export const Animated3DIcon = ({ icon: Icon, color, bgGradient }: Animated3DIconProps) => {
  return (
    <div className="relative group">
      {/* 3D Shadow layers */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-20 blur-xl animate-pulse-3d" style={{ background: bgGradient }} />
      
      {/* Main icon container with 3D effect */}
      <div 
        className={`relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-float`}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(1000px) rotateX(10deg) rotateY(-10deg)',
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm" />
        
        {/* Icon */}
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
        
        {/* 3D depth effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shine" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

// Preset 3D Icons for each PDF tool
export const MergeIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Combine} 
    color="from-cyan-500 to-blue-600"
    bgGradient="linear-gradient(135deg, #06b6d4, #2563eb)"
  />
);

export const SplitIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Split} 
    color="from-orange-500 to-red-600"
    bgGradient="linear-gradient(135deg, #f97316, #dc2626)"
  />
);

export const CompressIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Minimize2} 
    color="from-green-500 to-emerald-600"
    bgGradient="linear-gradient(135deg, #22c55e, #059669)"
  />
);

export const PDFToWordIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').FileText} 
    color="from-blue-500 to-indigo-600"
    bgGradient="linear-gradient(135deg, #3b82f6, #4f46e5)"
  />
);

export const WordToPDFIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').FileText} 
    color="from-blue-600 to-purple-600"
    bgGradient="linear-gradient(135deg, #2563eb, #9333ea)"
  />
);

export const RotateIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').RotateCw} 
    color="from-pink-500 to-rose-600"
    bgGradient="linear-gradient(135deg, #ec4899, #e11d48)"
  />
);

export const ProtectIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Lock} 
    color="from-purple-500 to-violet-600"
    bgGradient="linear-gradient(135deg, #a855f7, #7c3aed)"
  />
);

export const UnlockIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Unlock} 
    color="from-cyan-500 to-teal-600"
    bgGradient="linear-gradient(135deg, #06b6d4, #0d9488)"
  />
);

export const SignIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').PenTool} 
    color="from-indigo-500 to-blue-600"
    bgGradient="linear-gradient(135deg, #6366f1, #2563eb)"
  />
);

export const WatermarkIcon3D = () => (
  <Animated3DIcon 
    icon={require('lucide-react').Stamp} 
    color="from-amber-500 to-orange-600"
    bgGradient="linear-gradient(135deg, #f59e0b, #ea580c)"
  />
);
