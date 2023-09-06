export interface MaintenanceItem {
  id?: string | undefined;
  category: string;
  label: string;
  control: string;
  lastCompletedDate: number;
  dueDate: number;
  sortOrder: number;
}

export interface ReactiveFormControls {
  [x: string]: any;
}
