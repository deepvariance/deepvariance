interface BrainIconProps {
  size?: number
  color?: string
  className?: string
}

export function BrainIcon({ size = 24, color = '#6366F1', className }: BrainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: 'block' }}
    >
      <path
        d="M12 3C10.5 3 9.5 4 9 5C8.5 4 7.5 3 6 3C4 3 2 5 2 7.5C2 9 2.5 10 3 11C2.5 12 2 13 2 14.5C2 17 4 19 6 19C7 19 8 18.5 8.5 18C9 19 10 20 11.5 20.5C11.7 20.8 12 21 12 21C12 21 12.3 20.8 12.5 20.5C14 20 15 19 15.5 18C16 18.5 17 19 18 19C20 19 22 17 22 14.5C22 13 21.5 12 21 11C21.5 10 22 9 22 7.5C22 5 20 3 18 3C16.5 3 15.5 4 15 5C14.5 4 13.5 3 12 3Z"
        fill={color}
        fillOpacity="0.2"
      />
      <path
        d="M12 3C10.5 3 9.5 4 9 5M12 3C13.5 3 14.5 4 15 5M12 3V7M9 5C8.5 4 7.5 3 6 3C4 3 2 5 2 7.5C2 9 2.5 10 3 11M9 5V9M15 5C15.5 4 16.5 3 18 3C20 3 22 5 22 7.5C22 9 21.5 10 21 11M15 5V9M3 11C2.5 12 2 13 2 14.5C2 17 4 19 6 19C7 19 8 18.5 8.5 18M3 11H7M21 11C21.5 12 22 13 22 14.5C22 17 20 19 18 19C17 19 16 18.5 15.5 18M21 11H17M8.5 18C9 19 10 20 11.5 20.5C11.7 20.8 12 21 12 21M8.5 18V14M15.5 18C15 19 14 20 12.5 20.5C12.3 20.8 12 21 12 21M15.5 18V14M12 21V17M9 9H7M15 9H17M9 14H7M15 14H17M9 9V14M15 9V14M12 7V17M12 7H15M12 7H9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
