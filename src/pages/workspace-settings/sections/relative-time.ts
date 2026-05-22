export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  if (diffSec < 60) return 'právě teď';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `před ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `před ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `před ${diffD} ${diffD === 1 ? 'dnem' : 'dny'}`;
  return new Date(ts).toLocaleDateString();
}

export function absoluteDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('cs-CZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
