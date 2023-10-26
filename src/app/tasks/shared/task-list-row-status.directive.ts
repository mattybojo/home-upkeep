import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { isAfter, isSameDay, set } from 'date-fns';
import { without } from 'lodash';

@Directive({
  selector: '[taskListRowStatus]'
})
export class TaskListRowStatusDirective implements OnChanges {
  // @ts-ignore
  @Input() doneDate: Date;
  // @ts-ignore
  @Input() dueDate: Date;
  // @ts-ignore
  @Input() isTouched: boolean = '';
  protected _elementClass: string[] = [];

  // @ts-ignore
  initialDoneDate: Date;

  // @ts-ignore
  initialDueDate: Date;

  @Input('class')
  @HostBinding('class')
  get elementClass(): string {
    return this._elementClass.join(' ');
  }
  set(val: string) {
    this._elementClass = val.split(' ');
  }

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    const errorClass: string = 'bg-red-700';

    if (!this.isTouched) {
      this.initialDoneDate = this.doneDate;
      this.initialDueDate = this.dueDate;
    }
    const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    let elClasses: string[] = ['flex', 'w-full'];

    // Error: Last completed date cannot be in the future
    if (isAfter(this.doneDate, today)) {
      elClasses.push(errorClass);
      elClasses.push('text-white');
    }

    // Warning: Due date is in the past so task has not been completed
    if (isAfter(today, this.dueDate)) {
      elClasses.push('bg-red-300');
    }

    if (!(changes['doneDate']?.firstChange && changes['dueDate']?.firstChange) && (this.initialDoneDate?.getTime() !== this.doneDate?.getTime() || this.initialDueDate?.getTime() !== this.dueDate?.getTime())) {
      elClasses.push('bg-purple-100');
    }

    // If doneDate and dueDate are the same date, task is considered 'done' so remove any error classes
    if (isSameDay(this.doneDate, this.dueDate) && !elClasses.includes(errorClass)) {
      elClasses.push('bg-green-200');
      elClasses = without(elClasses, ...['bg-red-300', 'bg-purple-100']);
    }

    this._elementClass = elClasses;
  }
}
