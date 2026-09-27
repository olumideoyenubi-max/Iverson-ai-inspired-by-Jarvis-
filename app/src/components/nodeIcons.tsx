// Small line icons for the module nodes.
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, className: "h-full w-full" };

export const NodeIcons = {
  vision: (
    <svg {...iconProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  motion: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M4.9 4.9a10 10 0 000 14.2M19.1 4.9a10 10 0 010 14.2" />
    </svg>
  ),
  voice: (
    <svg {...iconProps}>
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M23 12h-2" />
    </svg>
  ),
  lights: (
    <svg {...iconProps}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
    </svg>
  ),
  comms: (
    <svg {...iconProps}>
      <path d="M21 12a8 8 0 01-11.6 7.1L4 21l1.9-5.4A8 8 0 1121 12z" />
    </svg>
  ),
  config: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  ),
};
