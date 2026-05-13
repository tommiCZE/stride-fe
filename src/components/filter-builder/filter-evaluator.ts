import type { TaskSummaryDto } from '../../api/types';

export type FilterField = 'status' | 'priority' | 'assignee' | 'label' | 'type';
export type FilterOp = 'is' | 'is not' | 'in';

export interface FilterRule {
  id: string;
  field: FilterField;
  op: FilterOp;
  value: string | string[];
}

export type FilterCombinator = 'AND' | 'OR';

export interface FilterGroup {
  id: string;
  combinator: FilterCombinator;
  /**
   * Mixed list of rules and (optionally) nested sub-groups.
   * Only ONE level of nesting is supported (see UI restrictions).
   */
  rules: Array<FilterRule | FilterGroup>;
}

export function isGroup(item: FilterRule | FilterGroup): item is FilterGroup {
  return (item as FilterGroup).combinator !== undefined;
}

/**
 * Read the comparable string value of a given field on a task.
 * Returns `null` when the field is not present on the summary DTO
 * (e.g. `label` is not part of `TaskSummaryDto`).
 */
function getTaskFieldValue(task: TaskSummaryDto, field: FilterField): string | string[] | null {
  switch (field) {
    case 'status':
      return task.status;
    case 'priority':
      return task.priority;
    case 'assignee':
      return task.assigneeId ?? '';
    case 'type':
      return task.type;
    case 'label':
      // `TaskSummaryDto` has no labels — caller will treat as "no match"
      // for any non-empty rule value.
      return null;
    default:
      return null;
  }
}

function evaluateRule(task: TaskSummaryDto, rule: FilterRule): boolean {
  const fieldValue = getTaskFieldValue(task, rule.field);

  // Normalize rule value to array form for uniform handling
  const ruleValues = Array.isArray(rule.value)
    ? rule.value
    : rule.value === ''
      ? []
      : [rule.value];

  // Empty rule: treat as "no constraint" → matches everything.
  if (ruleValues.length === 0) return true;

  // Field not available on summary DTO (e.g. labels):
  // we can't prove a match, so the rule fails.
  if (fieldValue === null) return false;

  const taskValues = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

  switch (rule.op) {
    case 'is':
      // Pass if the single rule value matches any of the task values.
      return ruleValues.some(v => taskValues.includes(v));
    case 'is not':
      return ruleValues.every(v => !taskValues.includes(v));
    case 'in':
      return ruleValues.some(v => taskValues.includes(v));
    default:
      return true;
  }
}

export function evaluate(task: TaskSummaryDto, group: FilterGroup): boolean {
  if (group.rules.length === 0) return true;

  const results = group.rules.map(item =>
    isGroup(item) ? evaluate(task, item) : evaluateRule(task, item),
  );

  return group.combinator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

/**
 * Count leaf rules (excluding empty groups). Useful for the "Filtry (N)" badge.
 */
export function countRules(group: FilterGroup): number {
  let n = 0;
  for (const item of group.rules) {
    if (isGroup(item)) n += countRules(item);
    else n += 1;
  }
  return n;
}

export function emptyGroup(combinator: FilterCombinator = 'AND'): FilterGroup {
  return {
    id: `g-${Math.random().toString(36).slice(2, 9)}`,
    combinator,
    rules: [],
  };
}

export function newRule(field: FilterField = 'status'): FilterRule {
  return {
    id: `r-${Math.random().toString(36).slice(2, 9)}`,
    field,
    op: 'is',
    value: '',
  };
}
