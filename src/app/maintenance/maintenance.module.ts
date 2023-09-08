import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MaintenanceChecklistComponent } from './maintenance-checklist/maintenance-checklist.component';
import { MaintenanceRoutingModule } from './maintenance-routing.moddule';
import { ChecklistRowStatusDirective } from './shared/checklist-row-status.directive';

@NgModule({
  declarations: [
    MaintenanceChecklistComponent,
    ChecklistRowStatusDirective
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
    DropdownModule
  ]
})
export class MaintenanceModule { }
