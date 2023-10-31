import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseUISignInFailure, FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';
import { SubSink } from 'subsink';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {

  private subs = new SubSink();

  constructor(private router: Router, private authService: AuthService) { }

  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    if (signInSuccessData.authResult.additionalUserInfo?.isNewUser) {
      this.authService.saveUserOnSignup(signInSuccessData.authResult.user!).subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (err: any) => {
          console.error(err);
          this.router.navigateByUrl('/');
        }
      });
    } else {
      this.router.navigateByUrl('/');
    }
  }

  errorCallback(errorData: FirebaseUISignInFailure) { }

  uiShownCallback() { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
