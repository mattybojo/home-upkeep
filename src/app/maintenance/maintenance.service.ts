import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, WriteBatch, collection, collectionData, doc, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { MaintenanceItem } from './maintenance.beans';

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
}
