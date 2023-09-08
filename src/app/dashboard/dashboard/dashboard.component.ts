import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { MaintenanceService } from '../../maintenance/maintenance.service';
import { MaintenanceItem } from '../../maintenance/maintenance.beans';
import { add, format, isAfter, isBefore, set } from 'date-fns';
import { Message } from 'primeng/api/message';
import { sortBy } from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  isExpanded: boolean = true;
  maintMessages: Message[] = [];
  nextWeekTasks: MaintenanceItem[] = [];

  private subs = new SubSink();

  constructor(private maintenanceService: MaintenanceService) { }

  ngOnInit(): void {
    this.subs.sink = this.maintenanceService.getMaintenanceItems().subscribe({
      next: (maintItems: MaintenanceItem[]) => {
        this.maintMessages = [];
        const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        const pastDueItems: MaintenanceItem[] = maintItems.filter((item: MaintenanceItem) => item.dueDate && isAfter(today, new Date(item.dueDate)));
        let pastDueSeverity: string = 'success';
        if (pastDueItems.length > 0) {
          pastDueSeverity = 'error';
        }
        this.maintMessages.push({ severity: pastDueSeverity, summary: 'Past Due Tasks', detail: `There are currently ${pastDueItems.length} past due tasks on your checklist.` });

        const nextWeek: Date = add(today, { days: 7 });
        this.nextWeekTasks = maintItems.filter((item: MaintenanceItem) => item.dueDate && isBefore(new Date(item.dueDate), nextWeek));
        this.nextWeekTasks.forEach((task: MaintenanceItem) => {
          task.dueDateString = format(+task.dueDate, 'MMM d (EEE)');
        });
        this.nextWeekTasks = sortBy(this.nextWeekTasks, ['dueDate', 'label']);
        this.maintMessages.push({ severity: 'info', summary: 'Upcoming Tasks', detail: `There are currently ${this.nextWeekTasks.length} tasks with due dates this next week.` });
      },
      error: (err) => console.error(err)
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
