import { PRIORITIES } from '../../constants/priorities';

interface Props { priority: string; size?: number }

export default function PriorityIcon({ priority, size = 14 }: Props) {
  const p = PRIORITIES.find(x => x.id === priority);
  if (!p) return null;

  const heights: [number, number, number] = [4, 7, 10];
  const bars: Record<string, [number, number, number]> = {
    URGENT: [1, 1, 1],
    HIGH:   [1, 1, 1],
    MEDIUM: [1, 1, 0.4],
    LOW:    [1, 0.4, 0.2],
  };

  return (
    // eslint-disable-next-line no-restricted-syntax -- SVG element needs flex-shrink as DOM style
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      {priority === 'URGENT' && <path d="M6 1.5 L10.5 9 L1.5 9 Z" fill={p.color}/>}
      {priority !== 'URGENT' && (bars[priority] ?? [1, 1, 1]).map((opacity, i) => (
        <rect key={i} x={1 + i * 3.3} y={11 - heights[i]} width={2.4} height={heights[i]}
              fill={p.color} opacity={opacity} rx="0.5"/>
      ))}
    </svg>
  );
}
