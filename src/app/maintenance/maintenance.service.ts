import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, WriteBatch, and, collection, collectionData, deleteDoc, doc, or, query, where, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { Category, MaintenanceItem } from './maintenance.beans';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(private db: Firestore, private authService: AuthService) { }

  getMaintenanceItems(): Observable<MaintenanceItem[]> {
    const maintItemsRef = query(collection(this.db, 'maintenanceItems'), or(where('category', '!=', 'personal'),
      and(where('category', '==', 'personal'),
        where('uid', '==', this.authService.user!.uid))));
    return collectionData(maintItemsRef, { idField: 'id' }) as Observable<MaintenanceItem[]>;
  }

  saveMaintenanceItems(maintItems: MaintenanceItem[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    maintItems.forEach((item: MaintenanceItem) => {
      if (!!item.id) {
        ref = doc(this.db, `maintenanceItems/${item.id}`);
        batch.update(ref, { ...item, uid: this.authService.user!.uid });
      } else {
        ref = doc(collection(this.db, 'maintenanceItems'));
        const { id, ...restOfItem } = item;
        batch.set(ref, { ...restOfItem, uid: this.authService.user!.uid });
      }
    });

    return from(batch.commit());
  }

  deleteMaintenanceItem(id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, `maintenanceItems/${id}`)));
  }

  getCategories(): Observable<Category[]> {
    const categoriesRef = collection(this.db, 'categories');
    return collectionData(categoriesRef, { idField: 'id' }) as Observable<Category[]>;
  }

  saveCategories(categories: Category[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    categories.forEach((category: Category) => {
      if (!!category.id) {
        ref = doc(this.db, `categories/${category.id}`);
        batch.update(ref, { ...category });
      } else {
        ref = doc(collection(this.db, 'categories'));
        const { id, ...restOfItem } = category;
        batch.set(ref, restOfItem);
      }
    });

    return from(batch.commit());
  }
}
