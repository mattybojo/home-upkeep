import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { format } from 'date-fns';

@Component({
  selector: 'hu-date-avatar',
  templateUrl: './date-avatar.component.html',
  styleUrls: ['./date-avatar.component.scss']
})
export class DateAvatarComponent implements OnChanges {
  @Input() date: Date | undefined;

  dayOfWeek: string = '';
  dateString: string = '';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.dayOfWeek = format(changes['date'].currentValue, 'E').toUpperCase();
    this.dateString = format(changes['date'].currentValue, 'MMM dd');
  }
}
