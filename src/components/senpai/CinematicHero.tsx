/**
 * SENPAI.TV - CinematicHero Component
 * Full-width hero section with parallax, gradients, and immersive layout
 */

import { ReactNode } from 'react';

type CinematicHeroProps = {
  title: string;
  subtitle?: string;
  image?: string;
  gradient?: 'violet-teal' | 'violet-pink' | 'teal-cyan' | 'custom';
  customGradient?: string;
  children?: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    color?: 'violet' | 'teal' | 'pink';
  };
  height?: 'sm' | 'md' | 'lg' | 'screen';
  overlay?: boolean;
  animated?: boolean;
};

export function CinematicHero({
  title,
  subtitle,
  image,
  gradient = 'violet-teal',
  customGradient,
  children,
  actionButton,
  height = 'lg',
  overlay = true,
  animated = true,
}: CinematicHeroProps) {
  const heightMap = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-[500px]',
    screen: 'h-screen',
  };

  const gradientMap: Record<string, string> = {
    'violet-teal': 'from-senpai-violet/30 to-senpai-teal/10',
    'violet-pink': 'from-senpai-violet/30 to-senpai-pink/10',
    'teal-cyan': 'from-senpai-teal/20 to-senpai-teal/5',
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${heightMap[height]} rounded-xl flex items-center justify-center`}
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Layers */}
      {!image && (
        <div className={`absolute inset-0 bg-gradient-to-b ${customGradient || gradientMap[gradient]}`} />
      )}

      {image && overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-senpai-bg/20 via-senpai-bg/40 to-senpai-bg/80" />
      )}

      {/* Animated Glow Overlays */}
      {animated && (
        <>
          <div
            className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #a16bff 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full opacity-10 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #2af0d9 0%, transparent 70%)',
              animation: 'float-slow 8s ease-in-out infinite',
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-8 flex flex-col items-center justify-center h-full gap-6">
        <div className="space-y-4">
          <h1 className="text-cinematic text-senpai-text font-[Anton] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-senpai-text-dim max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className={`mt-4 px-8 py-3 rounded-lg font-bold text-senpai-text transition-all duration-300 active:scale-95 ${
              actionButton.color === 'teal'
                ? 'bg-senpai-teal text-senpai-bg hover:shadow-lg glow-teal'
                : actionButton.color === 'pink'
                  ? 'bg-senpai-pink text-senpai-text glow-pink'
                  : 'bg-senpai-violet hover:bg-senpai-violet-2 glow-violet'
            }`}
          >
            {actionButton.label}
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
