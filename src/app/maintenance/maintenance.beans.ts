import { UserDataPermission } from '../app.beans';

export interface MaintenanceItem extends UserDataPermission {
  id?: string;
  category: string;
  label: string;
  control: string;
  lastCompletedDate: number;
  dueDate: number;
  sortOrder: number;
  notes: string;
  dueDateString?: string;
  uid?: string;
  categoryLabel?: string;
}

export interface Category extends UserDataPermission {
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

export type ChecklistType = 'category' | 'date';
export type AccordionAction = 'collapse' | 'expand';
