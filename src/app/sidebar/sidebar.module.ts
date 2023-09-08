import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MenuModule
  ],
  exports: [SidebarComponent]
})
export class SidebarModule { }
