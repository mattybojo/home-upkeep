import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { TaskListRowStatusDirective } from './shared/task-list-row-status.directive';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskModalComponent } from './task-modal/task-modal.component';
import { TasksRoutingModule } from './tasks-routing.module';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskListRowStatusDirective,
    TaskModalComponent,
    CategoryModalComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    CalendarModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    OverlayPanelModule,
    DynamicDialogModule,
    CKEditorModule,
    ConfirmPopupModule,
    TooltipModule
  ]
})
export class TasksModule { }
