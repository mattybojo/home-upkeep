export interface AuthDropdownOption {
  label: string;
  iconClass: string;
  hidden: boolean;
  url?: string;
  handler?: (event: Event) => void
}

export interface DropdownChangeEvent<T> {
  originalEvent: PointerEvent;
  value: T;
}

export interface ReactiveFormControls {
  [x: string]: any;
}

export interface UserDataPermission {
  sharedWith: string[];
}
