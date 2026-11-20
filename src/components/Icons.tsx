import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const baseProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true as const,
});

export const IconSearch: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
);

export const IconGrid: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);

export const IconTable: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <rect x="2" y="2.5" width="12" height="11" rx="1" />
    <path d="M2 6h12M6 6v7.5" />
  </svg>
);

export const IconLayers: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M8 2L2 5.2 8 8.4l6-3.2L8 2z" />
    <path d="M2 8.2L8 11.4l6-3.2" />
    <path d="M2 11.2L8 14.4l6-3.2" />
  </svg>
);

export const IconSun: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M13 9.8A5.2 5.2 0 0 1 6.2 3a5.2 5.2 0 1 0 6.8 6.8z" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const IconArrowLeft: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M2 3.5h12L9.5 8.5v4l-3 1.5v-5.5L2 3.5z" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M3 8.5l3.2 3.2L13 4.5" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
    <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </svg>
);

export const IconShield: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M8 2L3 4v4c0 3.1 2.2 5.2 5 6 2.8-.8 5-2.9 5-6V4L8 2z" />
    <path d="M5.8 8.2L7.3 9.7 10.4 6.5" />
  </svg>
);

export const IconTerminal: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <rect x="1.8" y="2.5" width="12.4" height="11" rx="1.2" />
    <path d="M4.5 6.2L6.8 8 4.5 9.8M8.2 9.8h3.2" />
  </svg>
);

export const IconExternal: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg {...baseProps(size, className)}>
    <path d="M9.5 2.5h4v4M13.5 2.5L7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
  </svg>
);
