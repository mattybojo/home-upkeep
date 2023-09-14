import { SelectItem } from 'primeng/api/selectitem';

export interface MaintenanceItem {
  id?: string;
  category: CategoryType;
  label: string;
  control: string;
  lastCompletedDate: number;
  dueDate: number;
  sortOrder: number;
  notes: string;
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
export type CategoryType = 'backyard' | 'bedroom' | 'car' | 'frontYard' | 'garage' | 'general' | 'guestRoom' | 'kitchen' | 'personal' | 'pet' | 'todo';

export const getCategoryTypes = (): SelectItem[] => {
  return [{
    label: 'Backyard',
    value: 'backyard'
  }, {
    label: 'Bedroom',
    value: 'bedroom'
  }, {
    label: 'Car',
    value: 'car'
  }, {
    label: 'Front Yard',
    value: 'frontYard'
  }, {
    label: 'Garage',
    value: 'garage'
  }, {
    label: 'General Housekeeping',
    value: 'general'
  }, {
    label: 'Guest Room',
    value: 'guestRoom'
  }, {
    label: 'Kitchen',
    value: 'kitchen'
  }, {
    label: 'Personal',
    value: 'personal'
  }, {
    label: 'Pet',
    value: 'pet'
  }, {
    label: 'Todo Item',
    value: 'todo'
  }];
}
