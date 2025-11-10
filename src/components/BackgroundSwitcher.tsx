import { useState, memo, useMemo } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { GridBackground } from './GridBackground';
import { FloatingOrbs } from './FloatingOrbs';
import { WaveAnimation } from './WaveAnimation';
import { NeuralNetworkBackground } from './NeuralNetworkBackground';
import { MatrixBackground } from './MatrixBackground';
import { GeometricBackground } from './GeometricBackground';
import { StarfieldBackground } from './StarfieldBackground';

type BackgroundType = 'particles' | 'grid' | 'orbs' | 'waves' | 'neural' | 'matrix' | 'geometric' | 'starfield';

export const BackgroundSwitcher = memo(() => {
  const [activeBackground] = useState<BackgroundType>('neural');

  const backgrounds = useMemo(() => ({
    particles: <AnimatedBackground />,
    grid: <GridBackground />,
    orbs: <FloatingOrbs />,
    waves: <WaveAnimation />,
    neural: <NeuralNetworkBackground />,
    matrix: <MatrixBackground />,
    geometric: <GeometricBackground />,
    starfield: <StarfieldBackground />,
  }), []);

  return (
    <>
      {backgrounds[activeBackground]}
    </>
  );
});
