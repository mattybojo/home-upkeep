import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  Firestore,
  collection, collectionData, doc, setDoc
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '@firebase/auth-types';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { HomeUpkeepUser } from './auth.beans';

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

    const localUser = localStorage.getItem('user');
    let isLoggedIn: boolean = false;
    if (localUser) {
      this._user = JSON.parse(localUser) as unknown as User;
      this.isLoggedIn$.next(true);
      isLoggedIn = true;
    }

    this.afAuth.authState.subscribe((user: User | null) => {
      this._user = user;

      if (!isLoggedIn) {
        this.isLoggedIn$.next(!!user);
      }

      if (!!user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
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
    return collectionData(usersRef) as Observable<User[]>;
  }

  saveUser(user: User): Observable<void> {
    return from(setDoc(doc(this.db, `users/${user.uid}`), this.convertToFirestoreUser(user)));
  }

  private convertToFirestoreUser(user: User): HomeUpkeepUser {
    return {
      displayName: user.displayName!,
      email: user.email!,
      emailVerified: user.emailVerified,
      dateCreated: new Date(user.metadata.creationTime!).getTime(),
      dateLastModified: new Date(user.metadata.lastSignInTime!).getTime(),
      isAdmin: false,
      phoneNumber: user.phoneNumber!,
      photoURL: user.photoURL!,
      uid: user.uid
    };
  }
}
