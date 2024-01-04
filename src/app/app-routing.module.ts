import { NgModule } from '@angular/core';
import { canActivate } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { redirectUnauthorizedToLogin } from './auth/auth-helpers';

const routes: Routes = [{
  path: '',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  ...canActivate(redirectUnauthorizedToLogin)
}, {
  path: 'tasks',
  loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule),
  ...canActivate(redirectUnauthorizedToLogin)
}, {
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
