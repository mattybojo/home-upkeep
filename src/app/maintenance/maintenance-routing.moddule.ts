import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceChecklistComponent } from './maintenance-checklist/maintenance-checklist.component';

const routes: Routes = [{
  path: '',
  component: MaintenanceChecklistComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
