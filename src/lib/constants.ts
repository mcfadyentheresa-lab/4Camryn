export const VITAMINS = [
  { id: 'vitamin-d', label: 'Vitamin D' },
  { id: 'magnesium', label: 'Magnesium' },
  { id: 'omega-3', label: 'Omega-3' },
  { id: 'iron', label: 'Iron' },
  { id: 'b-complex', label: 'B complex' },
  { id: 'zinc', label: 'Zinc' },
];

export const VITAMIN_LABELS: Record<string, string> = Object.fromEntries(
  VITAMINS.map(v => [v.id, v.label])
);

export const ENV_CHECKS = [
  { id: 'bedroom-tidy', label: 'Bedroom tidy' },
  { id: 'kitchen-reset', label: 'Kitchen reset' },
  { id: 'bag-ready', label: 'Bag / outfit ready' },
  { id: 'workspace-clear', label: 'Workspace clear' },
  { id: 'phone-limits', label: 'Screen limits on' },
  { id: 'sleep-setup', label: 'Sleep setup done' },
];

export const ENV_LABELS: Record<string, string> = Object.fromEntries(
  ENV_CHECKS.map(c => [c.id, c.label])
);
