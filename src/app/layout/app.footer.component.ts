import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { DateTime } from 'luxon';
import { faToolbox } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
})
export class AppFooterComponent {
    copyrightYear: string = DateTime.now().toFormat('yyyy');

    // Icons

    faToolbox = faToolbox;

    constructor(public layoutService: LayoutService) { }

    get logoColor() {
        return this.layoutService.config().colorScheme === 'light'
            ? 'dark'
            : 'white';
    }
}
