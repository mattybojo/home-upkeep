import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MenuItem } from 'primeng/api/menuitem';

export interface MenuChangeEvent {
  key: string;
  routeEvent?: boolean;
}

export interface FontAwesomeIcon {
  iconName?: IconDefinition;
}

export interface AuthDropdownOption extends FontAwesomeIcon {
  label: string;
  hidden: boolean;
  url?: string;
  handler?: () => void
}

export type HomeUpkeepMenuItem = MenuItem & FontAwesomeIcon;

export interface ReactiveFormControls {
  [x: string]: any;
}

export interface UserDataPermission {
  sharedWith: string[];
}
