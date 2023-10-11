import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, WriteBatch, addDoc, collection, collectionData, deleteDoc, doc, query, setDoc, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AppService } from '../app.service';
import { AuthService } from '../auth/auth.service';
import { Meal, Recipe } from './meal.beans';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(private db: Firestore, private appService: AppService, private authService: AuthService) { }

  // TODO: Update with user permissions
  getRecipes(): Observable<Recipe[]> {
    const recipeRef = query(collection(this.db, 'recipes'), this.authService.whereCurrentUserIsAllowed);
    return collectionData(recipeRef, { idField: 'id' }) as Observable<Recipe[]>;
  }

  saveRecipe(recipe: Recipe): Observable<DocumentReference<DocumentData> | void> {
    if (!!recipe.id) {
      return from(setDoc(doc(this.db, `recipes/${recipe.id}`), recipe));
    } else {
      return from(addDoc(collection(this.db, 'recipes'), recipe));
    }
  }

  deleteRecipe(id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, `recipes/${id}`)));
  }

  // TODO: Update with user permissions
  getMeals(): Observable<Meal[]> {
    const mealRef = collection(this.db, 'meals');
    return collectionData(mealRef, { idField: 'id' }) as Observable<Meal[]>;
  }

  saveMeals(meals: Meal[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    meals.forEach((item: Meal) => {
      if (!!item.id) {
        ref = doc(this.db, `meals/${item.id}`);
        const { id, ...restOfItem } = item;
        restOfItem.recipes = this.appService.convertToPureJavascriptObject(restOfItem.recipes);
        batch.update(ref, { ...restOfItem });
      } else {
        ref = doc(collection(this.db, 'meals'));
        const { id, ...restOfItem } = item;
        restOfItem.recipes = this.appService.convertToPureJavascriptObject(restOfItem.recipes);
        batch.set(ref, { ...restOfItem });
      }
    });

    return from(batch.commit());
  }

  deleteMeals(ids: string[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    ids.forEach((itemId: string) => {
      batch.delete(doc(this.db, `meals/${itemId}`));
    });

    return from(batch.commit());
  }
}
