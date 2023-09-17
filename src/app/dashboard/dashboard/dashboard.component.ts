import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { MaintenanceService } from '../../maintenance/maintenance.service';
import { MaintenanceItem } from '../../maintenance/maintenance.beans';
import { add, format, isAfter, isBefore, isSameDay, set } from 'date-fns';
import { Message } from 'primeng/api/message';
import { sortBy } from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  isExpanded: boolean = true;
  pastDueTasksMessages: Message[] = [];
  upcomingTasksMessages: Message[] = [];
  pastDueTasks: MaintenanceItem[] = [];
  upcomingTasks: MaintenanceItem[] = [];

  private subs = new SubSink();

  constructor(private maintenanceService: MaintenanceService) { }

  ngOnInit(): void {
    this.subs.sink = this.maintenanceService.getMaintenanceItems().subscribe({
      next: (maintItems: MaintenanceItem[]) => {
        this.pastDueTasksMessages = [];
        this.upcomingTasksMessages = [];
        const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        this.pastDueTasks = maintItems.filter((item: MaintenanceItem) => item.dueDate && isAfter(today, new Date(item.dueDate)) && !isSameDay(item.dueDate, item.lastCompletedDate));
        let pastDueSeverity: string = 'success';
        if (this.pastDueTasks.length > 0) {
          pastDueSeverity = 'error';
        }
        this.pastDueTasksMessages.push({ severity: pastDueSeverity, summary: 'Past Due Tasks', detail: `There ${this.pastDueTasks.length === 1 ? 'is' : 'are'} currently ${this.pastDueTasks.length} past due task(s) on your checklist.` });

        const nextWeek: Date = add(today, { days: 7 });
        this.upcomingTasks = maintItems.filter((item: MaintenanceItem) => item.dueDate && isBefore(new Date(item.dueDate), nextWeek)
          && !isSameDay(item.dueDate, item.lastCompletedDate) && !isBefore(new Date(item.dueDate), today));
        this.upcomingTasks.forEach((task: MaintenanceItem) => {
          task.dueDateString = format(+task.dueDate, 'MMM d (EEE)');
        });
        this.upcomingTasks = sortBy(this.upcomingTasks, ['dueDate', 'label']);
        this.upcomingTasksMessages.push({ severity: 'info', summary: 'Upcoming Tasks', detail: `There ${this.upcomingTasks.length === 1 ? 'is' : 'are'} currently ${this.upcomingTasks.length} tasks with due dates this next week.` });
      },
      error: (err) => console.error(err)
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
