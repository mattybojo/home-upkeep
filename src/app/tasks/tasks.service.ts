import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, WriteBatch, addDoc, collection, collectionData, deleteDoc, doc, query, setDoc, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Category, Task } from './tasks.beans';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private db: Firestore, private authService: AuthService) { }

  getTasks(): Observable<Task[]> {
    const maintItemsRef = query(collection(this.db, 'tasks'), this.authService.whereSharedWithCurrentUser);
    return collectionData(maintItemsRef, { idField: 'id' }) as Observable<Task[]>;
  }

  saveTask(task: Task): Observable<DocumentReference<DocumentData> | void> {
    if (!!task.id) {
      return from(setDoc(doc(this.db, `tasks/${task.id}`), task));
    } else {
      return from(addDoc(collection(this.db, 'tasks'), task));
    }
  }

  saveTasks(tasks: Task[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    tasks.forEach((item: Task) => {
      if (!!item.id) {
        ref = doc(this.db, `tasks/${item.id}`);
        const { id, ...restOfItem } = item;
        batch.update(ref, { ...restOfItem, uid: this.authService.user!.uid });
      } else {
        ref = doc(collection(this.db, 'tasks'));
        const { id, ...restOfItem } = item;
        batch.set(ref, { ...restOfItem, uid: this.authService.user!.uid });
      }
    });

    return from(batch.commit());
  }

  deleteTask(id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, `tasks/${id}`)));
  }

  getCategories(): Observable<Category[]> {
    const categoriesRef = query(collection(this.db, 'categories'), this.authService.whereSharedWithCurrentUser);
    return collectionData(categoriesRef, { idField: 'id' }) as Observable<Category[]>;
  }

  saveCategory(category: Category): Observable<DocumentReference<DocumentData> | void> {
    if (!!category.id) {
      return from(setDoc(doc(this.db, `categories/${category.id}`), category));
    } else {
      return from(addDoc(collection(this.db, 'categories'), category));
    }
  }

  saveCategories(categories: Category[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    categories.forEach((category: Category) => {
      if (!!category.id) {
        ref = doc(this.db, `categories/${category.id}`);
        const { id, items, filteredItems, isExpanded, ...restOfItem } = category;
        batch.update(ref, { ...restOfItem });
      } else {
        ref = doc(collection(this.db, 'categories'));
        const { id, items, filteredItems, isExpanded, ...restOfItem } = category;
        batch.set(ref, restOfItem);
      }
    });

    return from(batch.commit());
  }

  deleteCategory(id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, `categories/${id}`)));
  }
}
