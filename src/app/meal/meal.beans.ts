import { UserDataPermission } from './../app.beans';

export interface Recipe extends UserDataPermission {
  id?: string;
  name: string;
  ingredients: string; // All ingredients for the recipe (e.g. 1/2 tsp salt, etc) in HTML
  instructions: string; // The instructions or steps for the recipe in HTML
  timeRequired: string; // Used to filter for quicker meals, format: hh:mm-hh:mm
  url?: string;
}

export interface Meal extends UserDataPermission {
  id?: string;
  date: number;
  recipes: Recipe[];
  notes: string;
}

export interface MealPlannerData {
  recipes: Recipe[];
  meals: Meal[];
}
