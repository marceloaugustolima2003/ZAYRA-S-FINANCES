import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  glow?: 'cyan' | 'lime' | 'pink' | 'purple' | 'none';
  delay?: number;
  neonBorderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  glow = 'none',
  delay = 0,
  neonBorderColor,
  ...rest
}) => {
  const glowStyle =
    glow === 'cyan'
      ? 'shadow-[0_12px_40px_rgba(0,240,255,0.14)] border-[#00F0FF]/30 hover:border-[#00F0FF]/50'
      : glow === 'lime'
      ? 'shadow-[0_12px_40px_rgba(57,255,20,0.14)] border-[#39FF14]/30 hover:border-[#39FF14]/50'
      : glow === 'pink'
      ? 'shadow-[0_12px_40px_rgba(255,112,166,0.16)] border-[#FF70A6]/30 hover:border-[#FF70A6]/50'
      : glow === 'purple'
      ? 'shadow-[0_12px_40px_rgba(138,43,226,0.16)] border-[#8A2BE2]/30 hover:border-[#8A2BE2]/50'
      : 'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] border-white/10 hover:border-white/20';

  const baseStyle =
    'relative overflow-hidden rounded-[30px] bg-gradient-to-b from-white/[0.09] via-white/[0.04] to-white/[0.015] backdrop-blur-[28px] border transition-colors duration-300';

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        interactive
          ? {
              y: -3,
              scale: 1.008,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        interactive
          ? {
              scale: 0.985,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      className={`${baseStyle} ${glowStyle} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={
        neonBorderColor
          ? {
              borderColor: `${neonBorderColor}40`,
              boxShadow: `0 12px 36px ${neonBorderColor}18`,
            }
          : undefined
      }
      {...rest}
    >
      {/* Top Specular Liquid Light reflection line */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Subtle ambient diagonal glass shine */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/[0.03] blur-2xl pointer-events-none" />

      {children}
    </motion.div>
  );
};
