import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { HomeUpkeepMenuItem } from '../app.beans';
import { faClipboardList, faHouse } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: HomeUpkeepMenuItem[] = [];

    ngOnInit() {
        this.model = [{
            label: 'Pages',
            iconName: undefined,
            items: [
                {
                    label: 'Dashboard',
                    iconName: faHouse,
                    routerLink: '/',
                }, {
                    label: 'Task List',
                    iconName: faClipboardList,
                    routerLink: '/tasks',
                }
            ]
        }
        ];
    }
}
