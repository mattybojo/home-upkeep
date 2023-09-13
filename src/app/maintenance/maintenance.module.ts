import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { MaintenanceChecklistComponent } from './maintenance-checklist/maintenance-checklist.component';
import { MaintenanceItemModalComponent } from './maintenance-item-modal/maintenance-item-modal.component';
import { MaintenanceRoutingModule } from './maintenance-routing.moddule';
import { ChecklistRowStatusDirective } from './shared/checklist-row-status.directive';

@NgModule({
  declarations: [
    MaintenanceChecklistComponent,
    ChecklistRowStatusDirective,
    MaintenanceItemModalComponent
  ],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    CalendarModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    OverlayPanelModule,
    DynamicDialogModule,
    CKEditorModule
  ]
})
export class MaintenanceModule { }
