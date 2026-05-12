export function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)        return 'právě teď';
  if (sec < 3600)      return `${Math.floor(sec / 60)} min`;
  if (sec < 86400)     return `${Math.floor(sec / 3600)} h`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} d`;
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}
