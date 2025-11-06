import { useEffect, useRef, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  type?: 'split' | 'blur' | 'shiny' | 'shuffle' | 'gradient' | 'typewriter';
  delay?: number;
}

export const AnimatedText = ({ text, className = '', type = 'split', delay = 0 }: AnimatedTextProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay for animation start
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = '1';
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (type === 'split') {
    return (
      <div ref={ref} className={`inline-block ${className}`}>
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block animate-slide-up-fade"
            style={{
              animationDelay: `${index * 0.03}s`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  }

  if (type === 'blur') {
    return (
      <div ref={ref} className={`inline-block ${className}`}>
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block animate-blur-in"
            style={{
              animationDelay: `${index * 0.04}s`,
              filter: 'blur(10px)',
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  }

  if (type === 'shiny') {
    return (
      <div ref={ref} className={`relative inline-block ${className}`}>
        <span className="shimmer">{text}</span>
      </div>
    );
  }

  if (type === 'shuffle') {
    return <ShuffleText text={text} className={className} />;
  }

  if (type === 'gradient') {
    return (
      <span className={`holographic ${className}`}>
        {text}
      </span>
    );
  }

  if (type === 'typewriter') {
    return <TypewriterText text={text} className={className} />;
  }

  return <span className={className}>{text}</span>;
};

const ShuffleText = ({ text, className = '' }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((_char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

const TypewriterText = ({ text, className = '' }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
