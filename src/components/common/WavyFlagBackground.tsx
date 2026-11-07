import React from 'react';

interface WavyFlagBackgroundProps {
  className?: string;
}

export const WavyFlagBackground: React.FC<WavyFlagBackgroundProps> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 1440 680"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMin slice"
      className="w-full h-full opacity-80 dark:opacity-25 transition-opacity duration-500"
    >
      <defs>
        <linearGradient id="flag-fade-mask" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="25%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flag-h-fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="15%" stopColor="#fff" stopOpacity="1" />
          <stop offset="85%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="flag-composite-mask">
          <rect width="1440" height="680" fill="url(#flag-fade-mask)" />
          <rect width="1440" height="680" fill="url(#flag-h-fade)" style={{ mixBlendMode: 'multiply' }} />
        </mask>
        <linearGradient id="cr-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#002b7f" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="cr-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ce1126" stopOpacity="0.04" />
          <stop offset="45%" stopColor="#e11d48" stopOpacity="0.075" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wave-highlight" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="90%" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <g mask="url(#flag-composite-mask)">
        <path
          d="M -100 120 C 220 50, 480 210, 800 130 C 1080 60, 1320 180, 1540 100 L 1540 210 C 1320 280, 1080 160, 800 230 C 480 300, 220 160, -100 210 Z"
          fill="url(#cr-blue-grad)"
        />
        <path
          d="M -100 205 C 220 155, 480 295, 800 225 C 1080 155, 1320 275, 1540 205 L 1540 255 C 1320 320, 1080 205, 800 275 C 480 345, 220 210, -100 255 Z"
          fill="url(#wave-highlight)"
        />
        <path
          d="M -100 250 C 220 205, 480 340, 800 270 C 1080 200, 1320 315, 1540 250 L 1540 430 C 1320 495, 1080 375, 800 450 C 480 520, 220 380, -100 430 Z"
          fill="url(#cr-red-grad)"
        />
        <path
          d="M -100 310 C 220 270, 480 400, 800 330 C 1080 270, 1320 380, 1540 320 L 1540 380 C 1320 440, 1080 330, 800 390 C 480 460, 220 330, -100 370 Z"
          fill="#e11d48"
          opacity="0.03"
        />
        <path
          d="M -100 425 C 220 375, 480 515, 800 445 C 1080 370, 1320 490, 1540 425 L 1540 475 C 1320 540, 1080 425, 800 495 C 480 565, 220 430, -100 475 Z"
          fill="url(#wave-highlight)"
        />
        <path
          d="M -100 470 C 220 425, 480 560, 800 490 C 1080 420, 1320 535, 1540 470 L 1540 580 C 1320 645, 1080 530, 800 600 C 480 670, 220 530, -100 580 Z"
          fill="url(#cr-blue-grad)"
        />
        <path
          d="M -100 160 C 260 220, 560 120, 920 180 C 1220 230, 1380 160, 1540 180"
          stroke="#1e3a8a"
          strokeWidth="1.2"
          strokeOpacity="0.07"
          strokeDasharray="4 6"
        />
        <path
          d="M -100 340 C 280 410, 580 300, 940 370 C 1240 430, 1400 350, 1540 370"
          stroke="#e11d48"
          strokeWidth="1.4"
          strokeOpacity="0.08"
          strokeDasharray="6 8"
        />
        <path
          d="M -100 520 C 270 590, 570 480, 930 550 C 1230 610, 1390 530, 1540 550"
          stroke="#1e3a8a"
          strokeWidth="1.2"
          strokeOpacity="0.07"
          strokeDasharray="4 6"
        />
      </g>
    </svg>
  </div>
);
