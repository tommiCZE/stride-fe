import { useMemo } from 'react';
import { getMockDevActivity } from '../mocks/dev-activity';
import type { TaskDevActivity } from '../types/dev-activity';

/**
 * Dev/Git activity (branches, commits, MRs, CI, reviews) for a task.
 *
 * Backed by FE mock data until the BE exposes git events. Lookup is by task key;
 * unknown keys return an empty dataset (no dev activity).
 */
export function useDevActivity(taskKey: string | undefined): TaskDevActivity {
  return useMemo(() => getMockDevActivity(taskKey), [taskKey]);
}
