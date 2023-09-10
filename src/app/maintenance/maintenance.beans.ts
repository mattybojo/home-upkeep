export interface MaintenanceItem {
  id?: string;
  category: CategoryType;
  label: string;
  control: string;
  lastCompletedDate: number;
  dueDate: number;
  sortOrder: number;
  dueDateString?: string;
  uid?: string;
}

export interface Category {
  id?: string;
  label: string;
  category: string;
  sortOrder: number;
  type: ChecklistType;
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

export type ChecklistType = 'category' | 'date';
export type CategoryType = 'backyard' | 'bedroom' | 'car' | 'frontYard' | 'garage' | 'general' | 'guestRoom' | 'kitchen' | 'personal' | 'pet';
