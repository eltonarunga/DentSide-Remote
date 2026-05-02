import React from 'react';

interface BrandMarkProps {
  size?: number;
  showText?: boolean;
  compact?: boolean;
  className?: string;
  textColor?: string;
  subTextColor?: string;
}

export default function BrandMark({
  size = 28,
  showText = true,
  compact = false,
  className = '',
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="bg-primary rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20"
        style={{ width: size * 1.25, height: size * 1.25 }}
      >
        <img
          src="/logo-icon.png"
          alt="DentSide Remote"
          className="w-3/5 h-3/5 object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-headline font-black text-on-surface tracking-tighter" style={{ fontSize: compact ? size * 0.55 : size * 0.7 }}>
            DentSide
          </span>
          <span className="font-bold text-primary uppercase tracking-[0.2em]" style={{ fontSize: compact ? size * 0.35 : size * 0.4 }}>
            Remote
          </span>
        </div>
      )}
    </div>
  );
}
