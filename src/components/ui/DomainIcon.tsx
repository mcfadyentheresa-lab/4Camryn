import type { ChallengeDomain } from '../../lib/challenges';

interface DomainIconProps {
  domain: ChallengeDomain;
  size?: number;
}

// Currentcolor line icons, one per challenge domain -- matches the stroke
// style Header.tsx already uses for the theme toggle rather than pulling in
// an icon library. Kept deliberately simple (2-4 strokes each).
export default function DomainIcon({ domain, size = 16 }: DomainIconProps) {
  const props = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none' as const };
  const stroke = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (domain) {
    case 'body':
      return (
        <svg {...props}>
          <path d="M2 8h1.6M12.4 8H14M4.8 8h6.4" {...stroke} />
          <rect x="1" y="6" width="2.6" height="4" rx="0.8" {...stroke} />
          <rect x="12.4" y="6" width="2.6" height="4" rx="0.8" {...stroke} />
        </svg>
      );
    case 'food':
      return (
        <svg {...props}>
          <path d="M8 2.5c-3 1-4 4-2.6 7.2C6 11.8 7 13 8 13.5c1-0.5 2-1.7 2.6-3.3C12 7 11 4 8 2.5Z" {...stroke} />
          <path d="M8 2.5c0.6 0.6 0.9 1.3 0.9 2" {...stroke} />
        </svg>
      );
    case 'space':
      return (
        <svg {...props}>
          <path d="M2 8.2 8 3l6 5.2" {...stroke} />
          <path d="M3.4 7.4V13h9.2V7.4" {...stroke} />
          <path d="M6.6 13v-3.4h2.8V13" {...stroke} />
        </svg>
      );
    case 'confidence':
      return (
        <svg {...props}>
          <path d="M8 2.2 9.4 6l4 0.2-3.2 2.5 1.1 3.9L8 10.4 4.7 12.6l1.1-3.9L2.6 6.2l4-0.2Z" {...stroke} />
        </svg>
      );
    case 'inspiration':
      return (
        <svg {...props}>
          <path d="M8 1.6v1.5M8 12.9v1.5M2.4 8h1.5M12.1 8h1.5M4.2 4.2l1 1M10.8 10.8l1 1M11.8 4.2l-1 1M5.2 10.8l-1 1" {...stroke} />
          <circle cx="8" cy="8" r="2.6" {...stroke} />
        </svg>
      );
    case 'money':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" {...stroke} />
          <path d="M8 4.6v6.8M9.8 6.2c0-0.9-0.8-1.6-1.8-1.6S6.2 5.3 6.2 6.2c0 2 3.6 1 3.6 3 0 0.9-0.8 1.6-1.8 1.6S6.2 10.1 6.2 9.2" {...stroke} />
        </svg>
      );
    case 'cycle':
      return (
        <svg {...props}>
          <path d="M12.8 8A4.8 4.8 0 1 1 8 3.2" {...stroke} />
          <path d="M8 1.4 8 4.2 10.4 3" {...stroke} />
        </svg>
      );
    case 'sleep':
      return (
        <svg {...props}>
          <path d="M10.4 2.4A5.6 5.6 0 1 0 13.6 9.3 4.4 4.4 0 0 1 10.4 2.4Z" {...stroke} />
        </svg>
      );
    case 'journal':
      return (
        <svg {...props}>
          <rect x="3" y="2" width="10" height="12" rx="1" {...stroke} />
          <path d="M6 5.5h4M6 8h4M6 10.5h2.4" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="3" {...stroke} />
        </svg>
      );
  }
}
