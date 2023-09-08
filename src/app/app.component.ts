import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthDropdownOption } from './app.beans';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  menuItems: MenuItem[] | undefined;
  authOptions: AuthDropdownOption[] | undefined;
  isSidebarVisible: boolean = false;

  loggedInAuthOptions: AuthDropdownOption[] = [{
    label: 'Profile',
    iconClass: 'fa-solid fa-user fa-fw',
    hidden: true,
    url: '/auth/profile'
  }, {
    label: 'Log Out',
    iconClass: 'fa-solid fa-arrow-right-from-bracket fa-fw',
    hidden: true,
    handler: (event: Event) => {
      this.authService.logout();
    }
  }];

  loggedOutAuthOptions: AuthDropdownOption[] = [{
    label: 'Login',
    iconClass: 'fa-solid fa-arrow-right-to-bracket fa-fw',
    hidden: false,
    url: '/auth/login'
  }];

  constructor(private authService: AuthService) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      this.setAuthOptions(isLoggedIn);
    });
  }

  setAuthOptions(isLoggedIn: boolean): void {
    this.authOptions = [];

    const permanentAuthOptions: AuthDropdownOption[] = [];

    if (isLoggedIn) {
      this.authOptions = [...permanentAuthOptions, ...this.loggedInAuthOptions];
    } else {
      this.authOptions = [...permanentAuthOptions, ...this.loggedOutAuthOptions];
    }
  }

  closeSidebar(): void {
    this.isSidebarVisible = false;
  }
}
