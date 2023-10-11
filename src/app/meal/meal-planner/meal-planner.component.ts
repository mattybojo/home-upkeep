import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Interval, add, eachDayOfInterval, format, isWithinInterval, startOfDay } from 'date-fns';
import { sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin, take } from 'rxjs';
import { SubSink } from 'subsink';
import { ReactiveFormControls } from '../../app.beans';
import { AuthService } from '../../auth/auth.service';
import { newMeal, newRecipe } from '../meal-helpers';
import { MealModalComponent } from '../meal-modal/meal-modal.component';
import { Meal, MealPlannerData, Recipe } from '../meal.beans';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';
import { MealService } from './../meal.service';

@Component({
  selector: 'app-meal-planner',
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.scss'],
  providers: [MessageService, DialogService]
})
export class MealPlannerComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = [];
  meals: Meal[] = [];
  mealForm: FormGroup | undefined = undefined;

  ref: DynamicDialogRef | undefined;
  isViewMode: boolean = true;

  initialFormValues: any = [];

  private subs = new SubSink();

  constructor(private mealService: MealService, private dialogService: DialogService,
    private messageService: MessageService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const obsArray = forkJoin({
      recipes: this.mealService.getRecipes().pipe(take(1)),
      meals: this.mealService.getMeals().pipe(take(1))
    });
    this.subs.sink = obsArray.subscribe({
      next: (data: MealPlannerData) => {
        const sharedWith: string[] = this.authService.getSharedWith();

        this.recipes = sortBy(data.recipes, 'name');
        this.recipes.splice(0, 0, newRecipe(sharedWith), newRecipe(sharedWith, 'Restaurant/Doordash'));

        // Ensure 2 weeks of dates
        let meals: Meal[] = JSON.parse(JSON.stringify(data.meals));
        const twoWeekInterval: Interval = {
          start: startOfDay(new Date()),
          end: startOfDay(add(new Date(), { weeks: 2 }))
        };
        const dateRange = eachDayOfInterval(twoWeekInterval);

        const idsToDelete: string[] = [];
        let returnValue: boolean;
        // Remove any meals that do not fall wihin the date range
        meals = meals.filter((meal: Meal) => {
          returnValue = isWithinInterval(meal.date, twoWeekInterval);
          if (!returnValue) {
            idsToDelete.push(meal.id!);
          }
          return returnValue;
        });

        // Delete any dates that fall outside of the next 2 weeks
        if (idsToDelete.length > 0) {
          this.mealService.deleteMeals(idsToDelete);
        }

        // Keep track of 2 weeks worth of meals, add meals for any missing days in that 2 week window
        let foundIndex: number;
        dateRange.forEach((date: Date) => {
          foundIndex = meals.findIndex((meal: Meal) => meal.date === date.getTime());
          if (foundIndex === -1) {
            meals.push(newMeal([newRecipe()], sharedWith, date, ''));
          }
        });

        // Create form and finish processing meals
        this.mealForm = new FormGroup(this.prepareFormControls(meals));
        this.initialFormValues = this.mealForm.value;
        this.meals = sortBy(meals, 'date');
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve recipes' });
      }
    });
  }

  addRecipe(meal: Meal) {
    const sharedWith: string[] = this.authService.getSharedWith();
    const foundIndex = this.meals.findIndex((theMeal: Meal) => theMeal.date === meal.date);
    if (foundIndex > -1) {
      this.mealForm!.addControl(`${meal.date}${meal.recipes.length}`, new FormControl(newRecipe(sharedWith), null));
      this.meals[foundIndex].recipes.push(newRecipe(sharedWith));
    }
  }

  createNewRecipe(): void {
    this.ref = this.dialogService.open(RecipeModalComponent, {
      header: 'Add Recipe',
      maximizable: true,
      data: {
        recipe: newRecipe(this.authService.getSharedWith()),
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (recipe: Recipe) => {
        if (!!recipe) {
          this.subs.sink = this.mealService.saveRecipe(recipe).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved recipe' });
              this.recipes.push(recipe);
              this.recipes = sortBy(this.recipes, 'name');
            },
            error: (err: any) => {
              console.error(err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save recipe' });
            }
          });
        }
      }
    });
  }

  onClickEditItem(item: Meal): void {
    this.ref = this.dialogService.open(MealModalComponent, {
      header: `Meals for ${format(item.date, 'E MMM d')}`,
      maximizable: true,
      data: {
        item: item,
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (meal: Meal) => {
        if (!!meal) {
          const foundIndex = this.meals.findIndex((theMeal: Meal) => theMeal.date === meal.date);
          if (foundIndex > -1) {
            this.meals[foundIndex] = meal;
          }
        }
        this.meals = this.meals.slice();
      }
    });
  }

  onClickDeleteItem(meal: Meal, index: number): void {
    const foundIndex = this.meals.findIndex((theMeal: Meal) => theMeal.date === meal.date);
    if (foundIndex > -1) {
      // TODO: Check for additional controls to change (controls of format `${meal.date}${index+1}` with index increasing until mealForm.get() returns null)
      index++;
      let control = this.mealForm!.get(`${meal.date}${index}`);
      while (control != null) {
        this.mealForm!.get(`${meal.date}${index - 1}`)!.setValue(this.mealForm!.get(`${meal.date}${index}`)!.value)
        index++;
        control = this.mealForm!.get(`${meal.date}${index}`);
      }

      // Set index to the value of the last index of the recipes array and remove the item
      index--;
      this.meals[foundIndex].recipes.splice(index, 1);
      this.mealForm!.removeControl(`${meal.date}${index}`);
    }
  }

  saveForm() {
    this.meals = this.populateMealsFromForm();
    this.mealService.saveMeals(this.meals).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved all meal data' });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save meal data' });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private prepareFormControls(items: Meal[]): ReactiveFormControls {
    const formControls: ReactiveFormControls = {};
    let numRecipes: number;
    let recipe: Recipe | undefined;
    items.forEach((item: Meal) => {
      numRecipes = item.recipes.length;
      for (let i = 0; i < numRecipes; i++) {
        recipe = item.recipes[i];
        formControls[`${item.date}${i}`] = new FormControl(recipe, null);
      }
    });
    return formControls;
  }

  private populateMealsFromForm(): Meal[] {
    const meals: Meal[] = [];
    let control: AbstractControl<any, any> | null;
    let index: number;

    this.meals.forEach((meal: Meal, i: number) => {
      meals.push(meal)
      index = 0;
      control = this.mealForm!.get(`${meal.date}${index}`);
      while (control != null) {
        meals[i].recipes[index] = control.value;
        // Populate the meal with the recipe
        index++;
        control = this.mealForm!.get(`${meal.date}${index}`);
      }
    });

    return meals;
  }
}
