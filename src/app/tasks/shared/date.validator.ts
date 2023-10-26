import { AbstractControl } from '@angular/forms';
import { isAfter } from 'date-fns';

export function ValidateCompletedDate(control: AbstractControl) {
  if (isAfter(control.value, new Date())) {
    return { invalidDate: true };
  }
  return null;
}
