import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withContainer?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  withContainer = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const roundedMap = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${sizeMap[size]} ${className}`}
    >
      {/* Background elegant purple glow */}
      <div className="absolute inset-0 rounded-full bg-purple-600/35 blur-md pointer-events-none" />

      {/* SVG Image direct link with fallback */}
      <img
        src="/zayra-logo.svg"
        alt="Zayra Logo"
        className={`relative w-full h-full object-contain ${
          roundedMap[size]
        } drop-shadow-[0_4px_18px_rgba(168,85,247,0.45)]`}
        loading="eager"
        onError={(e) => {
          // If image fails, fallback to inline SVG representation
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};
