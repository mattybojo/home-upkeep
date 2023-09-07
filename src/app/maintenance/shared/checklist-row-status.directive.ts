import { Directive, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { isAfter, set } from 'date-fns';

@Directive({
  selector: '[checklistRowStatus]'
})
export class ChecklistRowStatusDirective implements OnInit, OnChanges {
  // @ts-ignore
  @Input() doneDate: Date;
  // @ts-ignore
  @Input() dueDate: Date;
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

  ngOnInit(): void {
    this.initialDoneDate = this.doneDate;
    this.initialDueDate = this.dueDate;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    let elClasses: string[] = ['flex', 'w-full'];

    // Error: Last completed date cannot be in the future
    if (isAfter(this.doneDate, today)) {
      elClasses.push('bg-red-700');
      elClasses.push('text-white');
    }

    // Warning: Due date is in the past so task has not been completed
    if (isAfter(today, this.dueDate)) {
      elClasses.push('bg-red-300');
    }

    if (!(changes['doneDate']?.firstChange && changes['dueDate']?.firstChange) && (this.initialDoneDate?.getTime() !== this.doneDate?.getTime() || this.initialDueDate?.getTime() !== this.dueDate?.getTime())) {
      elClasses.push('bg-purple-100');
    }

    this._elementClass = elClasses;
  }
}
