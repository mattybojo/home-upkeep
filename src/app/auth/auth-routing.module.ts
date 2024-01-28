import { NgModule } from '@angular/core';
import { canActivate } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { redirectLoggedInToDashboard, redirectUnauthorizedToLogin } from './auth-helpers';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [{
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToDashboard)
}, {
    path: 'profile',
    component: ProfileComponent,
    ...canActivate(redirectUnauthorizedToLogin)
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
