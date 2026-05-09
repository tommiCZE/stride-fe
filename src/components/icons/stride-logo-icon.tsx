interface Props { size?: number; color?: string }

export default function StrideLogoIcon({ size = 22, color }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 3 L19 3 L19 7 L9 7 L9 11 L17 11 L17 15 L9 15 L9 21 L5 21 Z"
            fill={color || 'currentColor'}/>
      <circle cx="19" cy="19" r="2.5" fill={color || 'currentColor'}/>
    </svg>
  );
}
