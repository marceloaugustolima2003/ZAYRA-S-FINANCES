import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  glow?: 'cyan' | 'lime' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  glow = 'none',
}) => {
  const glowStyle =
    glow === 'cyan'
      ? 'shadow-[0_8px_32px_rgba(0,240,255,0.12)] border-[#00F0FF]/25'
      : glow === 'lime'
      ? 'shadow-[0_8px_32px_rgba(57,255,20,0.12)] border-[#39FF14]/25'
      : 'shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)] border-white/10';

  const baseStyle =
    'relative overflow-hidden rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-[24px] border transition-all duration-300';

  const interactiveStyle = interactive
    ? 'cursor-pointer active:scale-[0.98] hover:border-white/20'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${glowStyle} ${interactiveStyle} ${className}`}
    >
      {/* Top subtle liquid specular highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
