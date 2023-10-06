import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MealPlannerComponent } from './meal-planner/meal-planner.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';

const routes: Routes = [{
  path: 'recipes',
  component: RecipeListComponent
}, {
  path: 'plan',
  component: MealPlannerComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealRoutingModule { }
