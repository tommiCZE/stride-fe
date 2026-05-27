import type { ReleaseDto } from '../api/types';

const SEMVER_RE = /^v(\d+)\.(\d+)\.(\d+)$/;
export const SEMVER_INPUT_RE = /^v\d+\.\d+\.\d+(-[\w.]+)?$/;

export type Bump = 'patch' | 'minor' | 'major';

interface ParsedVersion { major: number; minor: number; patch: number }

function parse(name: string): ParsedVersion | null {
  const m = SEMVER_RE.exec(name);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function compareDesc(a: ParsedVersion, b: ParsedVersion): number {
  return b.major - a.major || b.minor - a.minor || b.patch - a.patch;
}

function latestVersion(releases: ReleaseDto[]): ParsedVersion | null {
  const parsed = releases.map(r => parse(r.name)).filter((p): p is ParsedVersion => p !== null);
  if (parsed.length === 0) return null;
  return parsed.sort(compareDesc)[0];
}

export function nextVersion(releases: ReleaseDto[], bump: Bump = 'patch'): string {
  const latest = latestVersion(releases);
  if (!latest) return 'v0.1.0';
  if (bump === 'major') return `v${latest.major + 1}.0.0`;
  if (bump === 'minor') return `v${latest.major}.${latest.minor + 1}.0`;
  return `v${latest.major}.${latest.minor}.${latest.patch + 1}`;
}

export function smartDefault(releases: ReleaseDto[]): { name: string; bump: Bump; parent: string | null } {
  const unreleased = releases.filter(r => r.status === 'unreleased');
  if (unreleased.length > 0) {
    const parent = unreleased[0].name;
    return { name: nextVersion([unreleased[0]], 'patch'), bump: 'patch', parent };
  }
  const released = releases.filter(r => r.status === 'released');
  if (released.length > 0) {
    const parent = released[0].name;
    return { name: nextVersion([released[0]], 'minor'), bump: 'minor', parent };
  }
  return { name: 'v0.1.0', bump: 'minor', parent: null };
}
