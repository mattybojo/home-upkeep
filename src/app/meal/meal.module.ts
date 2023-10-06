import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollerModule } from 'primeng/scroller';
import { ToastModule } from 'primeng/toast';
import { MealModalComponent } from './meal-modal/meal-modal.component';
import { MealPlannerComponent } from './meal-planner/meal-planner.component';
import { MealRoutingModule } from './meal-routing.module';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeModalComponent } from './recipe-modal/recipe-modal.component';
import { DateAvatarComponent } from './shared/date-avatar/date-avatar.component';


@NgModule({
  declarations: [
    MealPlannerComponent,
    RecipeModalComponent,
    RecipeListComponent,
    DateAvatarComponent,
    MealModalComponent
  ],
  imports: [
    CommonModule,
    MealRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollerModule,
    ButtonModule,
    CKEditorModule,
    ToastModule,
    DropdownModule,
    InputTextModule,
    ConfirmPopupModule,
    DataViewModule,
  ]
})
export class MealModule { }
