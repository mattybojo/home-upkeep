import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToastModule } from 'primeng/toast';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { InputTextModule } from 'primeng/inputtext';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [
        LoginComponent,
        ProfileComponent
    ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        AvatarModule,
        ReactiveFormsModule,
        ButtonModule,
        ToastModule,
        KeyFilterModule,
        DialogModule,
        InputTextModule,
        FontAwesomeModule
    ]
})
export class AuthModule { }
