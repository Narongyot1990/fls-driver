export interface TaskCategory {
  value: string;
  label: string;
}

export const TASK_CATEGORIES: TaskCategory[] = [
  { value: 'safety', label: 'เธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข' },
  { value: 'driving', label: 'เธเธฒเธฃเธเธฑเธเธฃเธ–' },
  { value: 'traffic', label: 'เธเธเธเธฃเธฒเธเธฃ' },
  { value: 'company', label: 'เธเธเธฃเธฐเน€เธเธตเธขเธ' },
  { value: 'other', label: 'เธญเธทเนเธเน' },
];

export function getTaskCategoryLabel(category: string): string {
  return TASK_CATEGORIES.find((item) => item.value === category)?.label || category;
}
