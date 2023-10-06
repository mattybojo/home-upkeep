import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() onCloseSidebar = new EventEmitter<any>();

  menuItems: MenuItem[] = [];

  constructor() { }

  ngOnInit(): void {
    const closeSidebar = () => this.onCloseSidebar.emit();

    this.menuItems = [{
      label: 'Dashboard',
      icon: 'fa-solid fa-house fa-fw',
      routerLink: '/',
      command: closeSidebar
    }, {
      label: 'Checklist',
      icon: 'fa-solid fa-clipboard-list fa-fw',
      routerLink: '/maintenance',
      command: closeSidebar
    }, {
      label: 'Recipe List',
      icon: 'fa-regular fa-file-lines fa-fw',
      routerLink: '/meals/recipes',
      command: closeSidebar,
    }, {
      label: 'Meal Plan',
      icon: 'fa-solid fa-utensils fa-fw',
      routerLink: '/meals/plan',
      command: closeSidebar,
    }];
  }
}
