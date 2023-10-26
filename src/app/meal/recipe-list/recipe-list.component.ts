import { Component, OnDestroy, OnInit } from '@angular/core';
import { sortBy } from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink';
import { DropdownChangeEvent } from '../../app.beans';
import { AuthService } from '../../auth/auth.service';
import { TaskSortOption } from '../../tasks/tasks.beans';
import { newRecipe } from '../meal-helpers';
import { Recipe } from '../meal.beans';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';
import { MealService } from './../meal.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = [];
  selectedRecipe: Recipe | undefined;
  filterValue: string = '';
  filteredRecipes: Recipe[] = [];

  ref: DynamicDialogRef | undefined;
  isViewMode: boolean = true;

  sortOptions: TaskSortOption[] = [{
    label: 'A-Z',
    icon: 'fa-solid fa-arrow-down-a-z fa-fw'
  }, {
    label: 'Time',
    icon: 'fa-solid fa-clock fa-fw'
  }];
  selectedSort: TaskSortOption = this.sortOptions[0];

  private subs = new SubSink();

  constructor(private mealService: MealService, private dialogService: DialogService,
    private messageService: MessageService, private confirmationService: ConfirmationService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subs.sink = this.mealService.getRecipes().subscribe({
      next: (recipes: Recipe[]) => {
        this.recipes = this.filteredRecipes = sortBy(recipes, 'name');
        if (this.filterValue?.length > 0) {
          this.filterRecipes();
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve recipes' });
      }
    });
  }

  addNewRecipe(): void {
    this.onClickEditItem(newRecipe(this.authService.getSharedWith()));
  }

  onClickEditItem(recipe: Recipe): void {
    this.ref = this.dialogService.open(RecipeModalComponent, {
      header: !!recipe.name ? 'Edit Recipe' : 'Add Recipe',
      maximizable: true,
      data: {
        recipe: recipe,
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (recipe: Recipe) => {
        if (!!recipe) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved recipe' });
        }
      }
    });
  }

  onClickDeleteItem(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: (event.currentTarget || event.target) as EventTarget,
      message: 'Are you sure that you want to delete?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subs.sink = this.mealService.deleteRecipe(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Recipe deleted successfully' });
          }, error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete task' });
          }
        });
      },
      reject: () => { }
    });
  }

  onChangeSortOption(event: DropdownChangeEvent<TaskSortOption>) {
    switch (event.value.label) {
      case 'A-Z':
        this.recipes = sortBy(this.recipes, 'name');
        this.filteredRecipes = sortBy(this.filteredRecipes, 'name');
        break;
      case 'Time':
        let timeReqd: string[];
        const sortFunction = (item: Recipe) => {
          timeReqd = item.timeRequired.split('-')[0].split(':');
          return +timeReqd[0] * 60 + +timeReqd[1];
        };
        this.recipes = sortBy(this.recipes, sortFunction);
        this.filteredRecipes = sortBy(this.filteredRecipes, sortFunction);
        break;
      default: console.error(`Invalid sort option: ${event.value.label}`);
    }
  }

  filterRecipes(): void {
    if (this.filterValue?.length > 0) {
      this.filteredRecipes = this.recipes.filter((item: Recipe) => item.ingredients.includes(this.filterValue) || item.instructions.includes(this.filterValue) || item.name.includes(this.filterValue));
    } else {
      this.filteredRecipes = this.recipes;
    }

  }

  resetFilter(): void {
    this.filterValue = '';
    this.filteredRecipes = this.recipes;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
