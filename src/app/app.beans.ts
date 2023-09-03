export interface AuthDropdownOption {
  label: string;
  iconClass: string;
  hidden: boolean;
  url?: string;
  handler?: (event: Event) => void
}
