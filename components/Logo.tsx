
import React from 'react';
import { Leaf, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', icon: 16, glow: 'blur-[10px]' },
    md: { container: 'w-10 h-10', icon: 20, glow: 'blur-[15px]' },
    lg: { container: 'w-16 h-16', icon: 32, glow: 'blur-[20px]' },
    xl: { container: 'w-24 h-24', icon: 48, glow: 'blur-[30px]' },
  };

  const dims = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${dims.container} ${className}`}>
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-primary/40 rounded-2xl ${dims.glow} animate-pulse-slow`}></div>
      
      {/* Main Container */}
      <div className="relative z-10 w-full h-full bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] transform transition-transform hover:scale-110 active:scale-95 duration-300">
        <div className="relative">
          <Leaf 
            size={dims.icon} 
            className="text-black" 
            strokeWidth={2.5}
          />
          <Sparkles 
            size={dims.icon * 0.5} 
            className="absolute -top-1 -right-1 text-black animate-bounce" 
            strokeWidth={3}
          />
        </div>
      </div>
    </div>
  );
};

export default Logo;
