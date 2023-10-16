import { Component, OnDestroy, OnInit } from '@angular/core';
import { add, format, isAfter, isBefore, isSameDay, set } from 'date-fns';
import { sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/api/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink';
import { MaintenanceItemModalComponent } from '../../maintenance/maintenance-item-modal/maintenance-item-modal.component';
import { MaintenanceItem } from '../../maintenance/maintenance.beans';
import { MaintenanceService } from '../../maintenance/maintenance.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DialogService, MessageService]
})
export class DashboardComponent implements OnInit, OnDestroy {

  isExpanded: boolean = true;
  pastDueTasksMessages: Message[] = [];
  upcomingTasksMessages: Message[] = [];
  maintItems: MaintenanceItem[] = []
  pastDueTasks: MaintenanceItem[] = [];
  upcomingTasks: MaintenanceItem[] = [];

  ref: DynamicDialogRef | undefined;

  private subs = new SubSink();

  constructor(private maintenanceService: MaintenanceService, private dialogService: DialogService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMaintenanceItems();
  }

  loadMaintenanceItems(): void {
    this.subs.sink = this.maintenanceService.getMaintenanceItems().subscribe({
      next: (maintItems: MaintenanceItem[]) => {
        this.maintItems = maintItems;
        this.pastDueTasksMessages = [];
        this.upcomingTasksMessages = [];
        const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        this.pastDueTasks = maintItems.filter((item: MaintenanceItem) => item.dueDate && isAfter(today, new Date(item.dueDate)) && !isSameDay(item.dueDate, item.lastCompletedDate));
        let pastDueSeverity: string = 'success';
        if (this.pastDueTasks.length > 0) {
          pastDueSeverity = 'error';
        }
        this.pastDueTasks.forEach((task: MaintenanceItem) => {
          task.dueDateString = format(+task.dueDate, 'MMM d (EEE)');
        });
        this.pastDueTasks = sortBy(this.pastDueTasks, ['dueDate', 'label']);
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

  editMaintenanceItem(item: MaintenanceItem): void {
    this.ref = this.dialogService.open(MaintenanceItemModalComponent, {
      header: item.label,
      maximizable: true,
      data: {
        item: item,
        maintItems: this.maintItems
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (maintItem: MaintenanceItem) => {
        if (!!maintItem) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated task data' });
          this.loadMaintenanceItems();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
