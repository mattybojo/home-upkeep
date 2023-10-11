import { Meal, Recipe } from './meal.beans';

export const newMeal = (recipes: Recipe[], sharedWith: string[], date?: Date, notes?: string): Meal => {
  return {
    date: !!date ? date.getTime() : 0,
    notes: !!notes ? notes : '',
    recipes: recipes.length > 0 ? recipes : [],
    sharedWith: !!sharedWith ? sharedWith : []
  };
}

export const newRecipe = (sharedWith?: string[], name?: string, ingredients?: string, instructions?: string, timeRequired?: string): Recipe => {
  return {
    name: !!name ? name : '',
    ingredients: !!ingredients ? ingredients : '',
    instructions: !!instructions ? instructions : '',
    timeRequired: !!timeRequired ? timeRequired : '',
    sharedWith: !!sharedWith ? sharedWith : []
  };
}

