import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />
  </svg>
);

export const RecipeIcon = () => (
  <svg {...base}>
    <path d="M7 3v7a2 2 0 0 0 2 2v9M5 3v5M9 3v5M17 3c-2 0-3 2-3 5s1 4 3 4v9" />
  </svg>
);

export const BasketIcon = () => (
  <svg {...base}>
    <path d="M3 10h18l-2 9H5zM8 10l2-5M16 10l-2-5" />
    <circle cx="9" cy="7" r="2.2" />
    <circle cx="14.5" cy="6.5" r="2.2" />
  </svg>
);

export const ScaleIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M8 9a5 5 0 0 1 8 0M12 9l1.5-2" />
    <path d="M7 15h10" />
  </svg>
);

export const NoteIcon = () => (
  <svg {...base}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4M3 7h3M3 12h3M3 17h3" />
  </svg>
);

export const FlagIcon = () => (
  <svg {...base}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
);

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);

export const HeartIcon = () => (
  <svg {...base}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);

export const MenuIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const WheelIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="1.8" />
    <path d="M12 3.5v6.7M12 13.8v6.7M3.5 12h6.7M13.8 12h6.7M6 6l4.7 4.7M13.3 13.3L18 18" />
    <path d="M12 1.5l-1.6 2.6h3.2z" fill="currentColor" stroke="none" />
  </svg>
);
