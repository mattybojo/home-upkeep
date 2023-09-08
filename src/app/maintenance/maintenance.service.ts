import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, WriteBatch, collection, collectionData, doc, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Category, MaintenanceItem } from './maintenance.beans';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(private db: Firestore) { }

  getMaintenanceItems(): Observable<MaintenanceItem[]> {
    const maintItemsRef = collection(this.db, 'maintenanceItems');
    return collectionData(maintItemsRef, { idField: 'id' }) as Observable<MaintenanceItem[]>;
  }

  saveMaintenanceItems(maintItems: MaintenanceItem[]): Observable<void> {
    const batch: WriteBatch = writeBatch(this.db);
    let ref: DocumentReference<DocumentData>;
    maintItems.forEach((item: MaintenanceItem) => {
      if (!!item.id) {
        ref = doc(this.db, `maintenanceItems/${item.id}`);
        batch.update(ref, { ...item });
      } else {
        ref = doc(collection(this.db, 'maintenanceItems'));
        const { id, ...restOfItem } = item;
        batch.set(ref, restOfItem);
      }
    });

    return from(batch.commit());
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
