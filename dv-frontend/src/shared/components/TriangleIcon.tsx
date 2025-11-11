interface TriangleIconProps {
  size?: number
  className?: string
}

export function TriangleIcon({ size = 24, className }: TriangleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient
          id={`triangleGradient-${size}`}
          x1="12"
          y1="4"
          x2="12"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path d="M12 4L20 20H4L12 4Z" fill={`url(#triangleGradient-${size})`} />
      <path
        d="M7 16L9.5 13L11 14.5L13.5 11L17 13.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  )
}
