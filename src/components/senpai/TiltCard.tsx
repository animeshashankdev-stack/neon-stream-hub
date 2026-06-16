/**
 * SENPAI.TV - TiltCard Component
 * Interactive 3D tilt effect with mouse tracking
 */

import { ReactNode, useRef, useState, useEffect } from 'react';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
  perspective?: number;
};

export function TiltCard({
  children,
  className = '',
  intensity = 15,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotationX = ((y - centerY) / centerY) * intensity;
      const rotationY = ((x - centerX) / centerX) * -intensity;

      setRotation({ x: rotationX, y: rotationY });
    };

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
      setIsHovering(false);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isHovering, intensity]);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ${className}`}
      style={{
        perspective: `${perspective}px`,
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
    >
      {children}
    </div>
  );
}

type GlowingCardProps = {
  children: ReactNode;
  color?: 'violet' | 'teal' | 'pink' | 'amber';
  className?: string;
};

export function GlowingCard({
  children,
  color = 'violet',
  className = '',
}: GlowingCardProps) {
  const colorMap = {
    violet: 'glow-violet hover:glow-violet-xl',
    teal: 'glow-teal hover:glow-teal-xl',
    pink: 'glow-pink',
    amber: '',
  };

  return (
    <div
      className={`glass-card rounded-xl p-6 transition-all duration-300 ${colorMap[color]} ${className}`}
    >
      {children}
    </div>
  );
}

type HoverLiftCardProps = {
  children: ReactNode;
  className?: string;
};

export function HoverLiftCard({ children, className = '' }: HoverLiftCardProps) {
  return (
    <div
      className={`transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:glow-violet ${className}`}
    >
      {children}
    </div>
  );
}
