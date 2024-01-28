import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { faArrowRightFromBracket, faArrowRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthDropdownOption } from '../app.beans';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopbarComponent {
    authOptions: AuthDropdownOption[] = [];
    isAllowedUser: boolean = false;

    loggedInAuthOptions: AuthDropdownOption[] = [{
        label: 'Profile',
        iconName: faUser,
        hidden: true,
        url: '/auth/profile'
    }, {
        label: 'Log Out',
        iconName: faArrowRightFromBracket,
        hidden: true,
        handler: () => {
            this.authService.logout();
        }
    }];

    loggedOutAuthOptions: AuthDropdownOption[] = [{
        label: 'Login',
        iconName: faArrowRightToBracket,
        hidden: false,
        url: '/auth/login'
    }];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
    @ViewChild('authMenu') authMenu!: ElementRef;

    faCircleUser = faCircleUser;

    constructor(public layoutService: LayoutService, public el: ElementRef, private authService: AuthService, private router: Router) {
        this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
            if (isLoggedIn && this.authService.getSharedWith().length > 0) {
                this.isAllowedUser = true;
            }
            this.setAuthOptions(isLoggedIn);
        });
    }

    get logoColor() {
        return this.layoutService.config().menuTheme === 'white' ||
            this.layoutService.config().menuTheme === 'orange'
            ? 'dark'
            : 'white';
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
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

    handleAuthOptionClicked(opt: AuthDropdownOption): void {
        // Default to navigate to the url, then handler
        if (!!opt.url && opt.url.length > 0) {
            this.router.navigateByUrl(opt.url);
        } else if (!!opt.handler) {
            opt.handler();
        }

        // Always close the menu on click
        this.authMenu.nativeElement.click();
    }
}
