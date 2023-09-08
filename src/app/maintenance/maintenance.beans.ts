export interface MaintenanceItem {
  id?: string;
  category: string;
  label: string;
  control: string;
  lastCompletedDate: number;
  dueDate: number;
  sortOrder: number;
  dueDateString?: string;
}

export interface Category {
  id?: string;
  label: string;
  category: string;
  sortOrder: number;
  type: CategoryType;
  items?: MaintenanceItem[];
  filteredItems?: MaintenanceItem[];
  isExpanded?: boolean;
}

export interface MaintenanceSortOption {
  label: string;
  icon: string;
}

export interface ReactiveFormControls {
  [x: string]: any;
}

export type CategoryType = 'category' | 'date';
