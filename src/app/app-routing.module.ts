import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { redirectUnauthorizedToLogin } from './auth/auth-helpers';
import { canActivate } from '@angular/fire/auth-guard';

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled'
};

const routes: Routes = [
    {
        path: '', component: AppLayoutComponent,
        children: [
            {
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
            }
        ]
    },
    { path: '**', redirectTo: '/' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
