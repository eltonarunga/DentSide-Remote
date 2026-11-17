import React, { useId } from 'react';
import { Link } from 'react-router-dom';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = '', size = 32 }) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `ds-bg-${uid}`;
  const toothId = `ds-tooth-${uid}`;
  const sheenId = `ds-sheen-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="48%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={toothId} x1="32" y1="14" x2="32" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
        <radialGradient id={sheenId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 14) rotate(50) scale(46)">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Squircle Canvas */}
      <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
      <rect width="64" height="64" rx="16" fill={`url(#${sheenId})`} />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="#FFFFFF"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />

      {/* Sculpted Symmetrical Dental Crown & Twin Roots */}
      <path
        d="M32 17.5C34.8 17.5 37.6 14.5 41.5 14.5C47.8 14.5 50.5 19.8 49.4 26.2C48.5 31.4 45.4 35.4 43.8 41.2C42.4 46.2 41 50.5 38.2 50.5C35.6 50.5 34.6 44.5 33.3 40.2C32.7 38.2 31.3 38.2 30.7 40.2C29.4 44.5 28.4 50.5 25.8 50.5C23 50.5 21.6 46.2 20.2 41.2C18.6 35.4 15.5 31.4 14.6 26.2C13.5 19.8 16.2 14.5 22.5 14.5C26.4 14.5 29.2 17.5 32 17.5Z"
        fill={`url(#${toothId})`}
      />

      {/* Integrated Teledentistry Diagnostic Pulse */}
      <path
        d="M22.5 27.5H27.2L29.6 22.8L32.4 31.4L35 25.2L36.8 27.5H41.5"
        stroke="#2563EB"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface BrandLogoProps {
  to?: string | null;
  size?: number;
  textClassName?: string;
  suffix?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/dashboard',
  size = 32,
  textClassName = 'text-xl',
  suffix,
  className = '',
}) => {
  const content = (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <BrandMark size={size} />
      <span
        className={`font-extrabold tracking-tight font-headline text-on-surface leading-none ${textClassName}`}
      >
        Dent<span className="text-[#2563EB] dark:text-blue-400">Side</span>
        {suffix && (
          <span className="font-semibold text-on-surface-variant ml-1.5 text-[0.72em]">
            {suffix}
          </span>
        )}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center whitespace-nowrap shrink-0">
        {content}
      </Link>
    );
  }

  return content;
};
