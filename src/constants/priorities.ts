export interface Priority {
  id: string;
  name: string;
  color: string;
}

export const PRIORITIES: Priority[] = [
  { id: 'URGENT', name: 'Urgent', color: '#dc2626' },
  { id: 'HIGH',   name: 'High',   color: '#ea580c' },
  { id: 'MEDIUM', name: 'Medium', color: '#eab308' },
  { id: 'LOW',    name: 'Low',    color: '#22c55e' },
];
