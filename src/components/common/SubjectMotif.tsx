import React from 'react';

export const SubjectMotif: React.FC<{ subjectId: string; className?: string }> = ({
  subjectId,
  className = '',
}) => {
  switch (subjectId) {
    case 'matematicas':
      // Geometric compass, coordinate grid, and parabola/circle arc
      return (
        <svg
          viewBox="0 0 160 160"
          className={`pointer-events-none select-none ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          {/* Subtle grid */}
          <line x1="20" y1="40" x2="140" y2="40" strokeDasharray="3 3" opacity="0.4" />
          <line x1="20" y1="80" x2="140" y2="80" strokeDasharray="3 3" opacity="0.4" />
          <line x1="20" y1="120" x2="140" y2="120" strokeDasharray="3 3" opacity="0.4" />
          <line x1="40" y1="20" x2="40" y2="140" strokeDasharray="3 3" opacity="0.4" />
          <line x1="80" y1="20" x2="80" y2="140" strokeDasharray="3 3" opacity="0.4" />
          <line x1="120" y1="20" x2="120" y2="140" strokeDasharray="3 3" opacity="0.4" />
          {/* Triangle & Compass */}
          <polygon points="80,30 135,130 25,130" strokeWidth="1.5" opacity="0.6" />
          <circle cx="80" cy="80" r="38" strokeWidth="1.2" opacity="0.5" />
          <path d="M40 120 Q 80 40 120 120" strokeWidth="1.8" opacity="0.7" />
        </svg>
      );

    case 'ciencias':
    case 'biologia':
    case 'quimica':
    case 'fisica':
      // Atomic orbital, beaker, leaf helix
      return (
        <svg
          viewBox="0 0 160 160"
          className={`pointer-events-none select-none ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          {/* Orbital rings */}
          <ellipse cx="80" cy="80" rx="60" ry="24" transform="rotate(30 80 80)" opacity="0.5" strokeWidth="1.4" />
          <ellipse cx="80" cy="80" rx="60" ry="24" transform="rotate(-30 80 80)" opacity="0.5" strokeWidth="1.4" />
          <ellipse cx="80" cy="80" rx="60" ry="24" transform="rotate(90 80 80)" opacity="0.35" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="7" fill="currentColor" opacity="0.4" />
          {/* Small orbital dots */}
          <circle cx="32" cy="52" r="3.5" fill="currentColor" opacity="0.6" />
          <circle cx="128" cy="108" r="3.5" fill="currentColor" opacity="0.6" />
        </svg>
      );

    case 'espanol':
    case 'ingles':
    case 'frances':
      // Open book, quill, letters typographic lines
      return (
        <svg
          viewBox="0 0 160 160"
          className={`pointer-events-none select-none ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          {/* Open Book curves */}
          <path d="M25 125 C 50 115, 75 120, 80 128 C 85 120, 110 115, 135 125 L 135 48 C 110 38, 85 43, 80 50 C 75 43, 50 38, 25 48 Z" strokeWidth="1.4" opacity="0.6" />
          <line x1="80" y1="50" x2="80" y2="128" strokeWidth="1.6" opacity="0.7" />
          {/* Text lines */}
          <line x1="38" y1="65" x2="68" y2="61" strokeDasharray="3 2" opacity="0.5" />
          <line x1="38" y1="80" x2="68" y2="76" strokeDasharray="3 2" opacity="0.5" />
          <line x1="38" y1="95" x2="68" y2="91" strokeDasharray="3 2" opacity="0.5" />
          <line x1="92" y1="61" x2="122" y2="65" strokeDasharray="3 2" opacity="0.5" />
          <line x1="92" y1="76" x2="122" y2="80" strokeDasharray="3 2" opacity="0.5" />
          <line x1="92" y1="91" x2="122" y2="95" strokeDasharray="3 2" opacity="0.5" />
        </svg>
      );

    case 'estudios-sociales':
    case 'educacion-civica':
    case 'formacion-ciudadana':
    default:
      // Globe latitude/longitude lines & pillars
      return (
        <svg
          viewBox="0 0 160 160"
          className={`pointer-events-none select-none ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          {/* Globe */}
          <circle cx="80" cy="80" r="50" strokeWidth="1.4" opacity="0.6" />
          <line x1="30" y1="80" x2="130" y2="80" strokeWidth="1.2" opacity="0.5" />
          <line x1="80" y1="30" x2="80" y2="130" strokeWidth="1.2" opacity="0.5" />
          <ellipse cx="80" cy="80" rx="30" ry="50" strokeWidth="1.2" opacity="0.45" />
          <ellipse cx="80" cy="80" rx="50" ry="24" strokeWidth="1.2" opacity="0.45" />
        </svg>
      );
  }
};
