import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResponsiveWrapper - Ensures proper layout across all devices
 * - Mobile (iPhone, Android): Single column, optimized spacing
 * - Tablet (iPad): Two columns, medium spacing
 * - Desktop (iMac, PC): Multi-column, full spacing
 */
export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  return (
    <div
      className={cn(
        // Base styles
        'w-full min-h-screen',
        // Mobile-first padding
        'px-4 py-6',
        // Tablet padding
        'md:px-6 md:py-8',
        // Desktop padding
        'lg:px-8 lg:py-10',
        // Extra large screens
        'xl:px-12 xl:py-12',
        '2xl:px-16 2xl:py-16',
        // Smooth transitions
        'transition-all duration-300',
        className
      )}
    >
      <div className="container mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}

/**
 * ResponsiveGrid - Responsive grid layout for cards/items
 */
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  }
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        // Mobile (default)
        `grid-cols-${cols.mobile}`,
        'gap-4',
        // Tablet
        `md:grid-cols-${cols.tablet}`,
        'md:gap-6',
        // Desktop
        `lg:grid-cols-${cols.desktop}`,
        'lg:gap-8',
        // Wide screens
        `2xl:grid-cols-${cols.wide}`,
        '2xl:gap-10',
        // Smooth transitions
        'transition-all duration-300',
        className
      )}
      style={{
        // Fallback for dynamic grid columns
        gridTemplateColumns: `repeat(${cols.mobile}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveSection - Section wrapper with proper spacing
 */
interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveSection({ children, className }: ResponsiveSectionProps) {
  return (
    <section
      className={cn(
        'w-full',
        // Mobile spacing
        'mb-8',
        // Tablet spacing
        'md:mb-12',
        // Desktop spacing
        'lg:mb-16',
        // Extra large spacing
        'xl:mb-20',
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * ResponsiveCard - Card component that adapts to screen size
 */
interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function ResponsiveCard({ children, className, interactive = true }: ResponsiveCardProps) {
  return (
    <div
      className={cn(
        // Base card styles
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        // Mobile padding
        'p-4',
        // Tablet padding
        'md:p-6',
        // Desktop padding
        'lg:p-8',
        // Interactive states
        interactive && [
          'transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-1',
          'active:scale-98',
          'cursor-pointer',
        ],
        // Touch-friendly on mobile
        'touch-manipulation',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveText - Text component with responsive sizing
 */
interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  className?: string;
}

export function ResponsiveText({ 
  children, 
  variant = 'body',
  className 
}: ResponsiveTextProps) {
  const variantClasses = {
    h1: cn(
      // Mobile
      'text-3xl font-bold',
      // Tablet
      'md:text-4xl',
      // Desktop
      'lg:text-5xl',
      // Extra large
      'xl:text-6xl'
    ),
    h2: cn(
      // Mobile
      'text-2xl font-bold',
      // Tablet
      'md:text-3xl',
      // Desktop
      'lg:text-4xl',
      // Extra large
      'xl:text-5xl'
    ),
    h3: cn(
      // Mobile
      'text-xl font-semibold',
      // Tablet
      'md:text-2xl',
      // Desktop
      'lg:text-3xl'
    ),
    h4: cn(
      // Mobile
      'text-lg font-semibold',
      // Tablet
      'md:text-xl',
      // Desktop
      'lg:text-2xl'
    ),
    body: cn(
      // Mobile
      'text-base',
      // Tablet
      'md:text-lg',
      // Desktop
      'lg:text-xl'
    ),
    small: cn(
      // Mobile
      'text-sm',
      // Tablet
      'md:text-base'
    ),
  };

  const Component = variant.startsWith('h') ? variant : 'p';

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}

/**
 * ResponsiveButton - Button with touch-friendly sizing
 */
interface ResponsiveButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function ResponsiveButton({ 
  children, 
  className,
  onClick,
  variant = 'primary',
  size = 'md'
}: ResponsiveButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    sm: cn(
      'px-4 py-2 text-sm',
      'md:px-5 md:py-2.5'
    ),
    md: cn(
      'px-6 py-3 text-base',
      'md:px-8 md:py-3.5',
      'lg:px-10 lg:py-4'
    ),
    lg: cn(
      'px-8 py-4 text-lg',
      'md:px-10 md:py-5',
      'lg:px-12 lg:py-6'
    ),
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        // Touch-friendly
        'touch-manipulation',
        'active:scale-95',
        // Minimum touch target (44x44px)
        'min-h-[44px] min-w-[44px]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}
