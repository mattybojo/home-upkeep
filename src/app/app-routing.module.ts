import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['/']);

const routes: Routes = [{
  path: '',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  ...canActivate(redirectUnauthorizedToLogin)
}, {
  path: 'tasks',
  loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule),
  ...canActivate(redirectUnauthorizedToLogin)
}, {
  path: 'meals',
  loadChildren: () => import('./meal/meal.module').then(m => m.MealModule),
  ...canActivate(redirectUnauthorizedToLogin)
}, {
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  ...canActivate(redirectLoggedInToDashboard)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
