import React from "react";

/** Success counterpart of `NoticeBadgeIcon`. Colored by `currentColor`. */
export const CheckBadgeIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path
      d="M4.8 8.3l2.1 2.1 4.3-4.6"
      fill="none"
      stroke="var(--color-background)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
