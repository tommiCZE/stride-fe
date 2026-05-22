import { TASK_TYPES } from '../../constants/taskTypes';

interface Props { type: string; size?: number }

export default function TypeIcon({ type, size = 14 }: Props) {
  const t = TASK_TYPES.find(x => x.id === type);
  if (!t) return null;

  const glyph = {
    STORY: <path d="M5.5 10.5 L9 14 L15 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    TASK:  <path d="M5.5 10.5 L9 14 L15 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    BUG:   <circle cx="10" cy="10" r="2.2" fill="#fff"/>,
    EPIC:  <path d="M11 4 L6 11 L9.5 11 L9 16 L14 9 L10.5 9 Z" fill="#fff"/>,
  }[type];

  return (
    // eslint-disable-next-line no-restricted-syntax -- SVG element needs flex-shrink as DOM style
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="16" height="16" rx="3.5" fill={t.color}/>
      {glyph}
    </svg>
  );
}
