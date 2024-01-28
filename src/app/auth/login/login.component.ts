import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faToolbox } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';
import { AuthProvider } from '../auth.beans';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [MessageService]
})
export class LoginComponent implements OnInit, OnDestroy {

    loginForm: FormGroup;

    private subs = new SubSink();

    // Icons
    faGoogle = faGoogle;
    faToolbox = faToolbox;

    constructor(private router: Router, private authService: AuthService, private messageService: MessageService) {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required])
        });
    }

    ngOnInit(): void {

    }

    registerNewUser(): void {
        this.authService.signIn(this.loginForm.value.name, this.loginForm.value.password, true, '');
    }

    signInWithPassword(): void {
        this.authService.signIn(this.loginForm.value.name, this.loginForm.value.password, false, '');
    }

    signInWithProvider(type: AuthProvider): void {
        this.authService.signIn('', '', false, type);
    }

    resetPassword(): void {
        if (!this.loginForm.value.email) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Enter your email to receive a reset email.' });
        } else {
            this.authService.resetPassword(this.loginForm.value.email);
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
