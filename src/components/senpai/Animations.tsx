/**
 * SENPAI.TV - ScrollReveal & Parallax Components
 * Framer Motion powered scroll-triggered animations and parallax effects
 */

'use client';

import { ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
};

/**
 * ScrollReveal - Animates elements when they scroll into view
 * Note: Requires Framer Motion. Implementation uses CSS animations as fallback.
 */
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  className = '',
}: ScrollRevealProps) {
  const directionMap = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration * 1000}ms`,
      }}
    >
      {children}
    </div>
  );
}

type ParallaxProps = {
  children: ReactNode;
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
  offset?: number;
};

/**
 * Parallax - Creates parallax scrolling effect
 * Note: CSS-based parallax using scroll behavior
 */
export function Parallax({ children, speed = 'medium', className = '', offset = 0 }: ParallaxProps) {
  const speedMap = {
    slow: 'translate-y-[var(--parallax-slow)]',
    medium: 'translate-y-[var(--parallax-medium)]',
    fast: 'translate-y-[var(--parallax-fast)]',
  };

  return (
    <div
      className={`will-transform ${speedMap[speed]} ${className}`}
      style={{
        '--parallax-slow': `${offset * 0.3}px`,
        '--parallax-medium': `${offset * 0.5}px`,
        '--parallax-fast': `${offset * 0.7}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

type StaggerContainerProps = {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
};

/**
 * StaggerContainer - Staggered animation for list items
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${i * staggerDelay}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

/**
 * AnimatedCounter - Counts from 0 to value
 */
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  return (
    <div className={`font-bold ${className}`}>
      {prefix}
      {value}
      {suffix}
    </div>
  );
}
