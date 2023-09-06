import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MaintenanceChecklistComponent } from './maintenance-checklist/maintenance-checklist.component';
import { MaintenanceRoutingModule } from './maintenance-routing.moddule';

@NgModule({
  declarations: [
    MaintenanceChecklistComponent
  ],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    ReactiveFormsModule,
    AccordionModule,
    CalendarModule,
    ToastModule,
  ]
})
export class MaintenanceModule { }
