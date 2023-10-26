import { Component, OnDestroy, OnInit } from '@angular/core';
import { add, format, isAfter, isBefore, isSameDay, set } from 'date-fns';
import { sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/api/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { SubSink } from 'subsink';
import { TaskModalComponent } from '../../tasks/task-modal/task-modal.component';
import { Category, Task } from '../../tasks/tasks.beans';
import { TasksService } from '../../tasks/tasks.service';

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
  tasks: Task[] = []
  pastDueTasks: Task[] = [];
  upcomingTasks: Task[] = [];

  ref: DynamicDialogRef | undefined;

  private subs = new SubSink();

  constructor(private tasksService: TasksService, private dialogService: DialogService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.subs.sink = zip(
      this.tasksService.getCategories(),
      this.tasksService.getTasks()
    ).subscribe({
      next: ([categories, tasks]) => {
        this.tasks = tasks;
        this.pastDueTasksMessages = [];
        this.upcomingTasksMessages = [];
        const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        this.pastDueTasks = tasks.filter((item: Task) => item.dueDate && isAfter(today, new Date(item.dueDate)) && !isSameDay(item.dueDate, item.lastCompletedDate));
        let pastDueSeverity: string = 'success';
        if (this.pastDueTasks.length > 0) {
          pastDueSeverity = 'error';
        }
        let foundIndex: number;
        this.pastDueTasks.forEach((task: Task) => {
          task.dueDateString = format(+task.dueDate, 'MMM d (EEE)');
          foundIndex = categories.findIndex((cat: Category) => cat.category === task.category);
          task.categoryLabel = !!categories[foundIndex] ? categories[foundIndex].label : 'Unassigned';
        });
        this.pastDueTasks = sortBy(this.pastDueTasks, ['dueDate', 'label']);
        this.pastDueTasksMessages.push({ severity: pastDueSeverity, summary: 'Past Due Tasks', detail: `There ${this.pastDueTasks.length === 1 ? 'is' : 'are'} currently ${this.pastDueTasks.length} past due task(s) on your checklist.` });

        const nextWeek: Date = add(today, { days: 7 });
        this.upcomingTasks = tasks.filter((item: Task) => item.dueDate && isBefore(new Date(item.dueDate), nextWeek)
          && !isSameDay(item.dueDate, item.lastCompletedDate) && !isBefore(new Date(item.dueDate), today));
        this.upcomingTasks.forEach((task: Task) => {
          task.dueDateString = format(+task.dueDate, 'MMM d (EEE)');
          foundIndex = categories.findIndex((cat: Category) => cat.category === task.category);
          task.categoryLabel = !!categories[foundIndex] ? categories[foundIndex].label : 'Unassigned';
        });
        this.upcomingTasks = sortBy(this.upcomingTasks, ['dueDate', 'label']);
        this.upcomingTasksMessages.push({ severity: 'info', summary: 'Upcoming Tasks', detail: `There ${this.upcomingTasks.length === 1 ? 'is' : 'are'} currently ${this.upcomingTasks.length} tasks with due dates this next week.` });
      },
      error: (err) => console.error(err)
    });
  }

  editTask(item: Task): void {
    this.ref = this.dialogService.open(TaskModalComponent, {
      header: item.label,
      maximizable: true,
      data: {
        item: item,
        tasks: this.tasks
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (task: Task) => {
        if (!!task) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated task data' });
          this.loadTasks();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
