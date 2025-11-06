import { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { GridBackground } from './GridBackground';
import { FloatingOrbs } from './FloatingOrbs';
import { WaveAnimation } from './WaveAnimation';
import { NeuralNetworkBackground } from './NeuralNetworkBackground';
import { MatrixBackground } from './MatrixBackground';
import { GeometricBackground } from './GeometricBackground';
import { StarfieldBackground } from './StarfieldBackground';
import { Layers } from 'lucide-react';

type BackgroundType = 'particles' | 'grid' | 'orbs' | 'waves' | 'neural' | 'matrix' | 'geometric' | 'starfield';

export const BackgroundSwitcher = () => {
  const [activeBackground, setActiveBackground] = useState<BackgroundType>('neural');

  const backgrounds = {
    particles: <AnimatedBackground />,
    grid: <GridBackground />,
    orbs: <FloatingOrbs />,
    waves: <WaveAnimation />,
    neural: <NeuralNetworkBackground />,
    matrix: <MatrixBackground />,
    geometric: <GeometricBackground />,
    starfield: <StarfieldBackground />,
  };

  const cycleBackground = () => {
    const types: BackgroundType[] = ['neural', 'particles', 'matrix', 'starfield', 'geometric', 'grid', 'orbs', 'waves'];
    const currentIndex = types.indexOf(activeBackground);
    const nextIndex = (currentIndex + 1) % types.length;
    setActiveBackground(types[nextIndex]);
  };

  return (
    <>
      {backgrounds[activeBackground]}
      
      {/* Background Switcher Button */}
      <button
        onClick={cycleBackground}
        className="fixed top-4 right-16 sm:top-6 sm:right-20 z-50 p-2 sm:p-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 group hidden sm:flex"
        aria-label="Switch background animation"
        title={`Current: ${activeBackground}`}
      >
        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 transition-transform group-hover:rotate-180 duration-500" />
      </button>

      {/* Background Indicator */}
      <div className="fixed top-16 right-16 sm:top-20 sm:right-20 z-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 text-xs text-purple-600 dark:text-purple-400 font-medium hidden sm:block">
        {activeBackground}
      </div>
    </>
  );
};
