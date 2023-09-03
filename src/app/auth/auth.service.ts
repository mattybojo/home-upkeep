import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  DocumentData,
  DocumentReference, Firestore,
  addDoc, collection, collectionData
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '@firebase/auth-types';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { HomneUpkeepUser } from './auth.beans';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user: User | null = null;

  get user() {
    return this._user;
  }

  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private afAuth: AngularFireAuth, private router: Router,
    private db: Firestore) {

    this.afAuth.authState.subscribe((user: User | null) => {
      console.log(user);

      this._user = user;
      this.isLoggedIn$.next(!!user);

      if (!!user && user?.metadata.creationTime === user?.metadata.lastSignInTime) {
        this.saveUser(user!);
      }
    });
  }

  ngOnInit(): void { }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigateByUrl('/auth/login');
    });
  }

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.db, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  private convertToFirestoreUser(user: User): HomneUpkeepUser {
    return {
      displayName: user.displayName!,
      email: user.email!,
      emailVerified: user.emailVerified,
      dateCreated: new Date(user.metadata.creationTime!).getTime(),
      dateLastModified: new Date(user.metadata.lastSignInTime!).getTime(),
      phoneNumber: user.phoneNumber!,
      photoURL: user.photoURL!
    };
  }

  private saveUser(user: User): Observable<DocumentReference<DocumentData | null>> {
    const giftCardsRef = collection(this.db, 'users');
    return from(addDoc(giftCardsRef, this.convertToFirestoreUser(this.user!)));
  }
}
