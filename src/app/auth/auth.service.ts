import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  Firestore,
  QueryCompositeFilterConstraint,
  QueryFieldFilterConstraint,
  collection, collectionData, doc, docData, or, setDoc, where
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '@firebase/auth-types';
import { flatten } from 'lodash';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { USER_GROUPS } from '../app.config';
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

  // Where clauses
  whereCurrentUserIsOwner!: QueryFieldFilterConstraint;
  whereSharedWithCurrentUser!: QueryFieldFilterConstraint;
  whereCurrentUserIsAllowed!: QueryCompositeFilterConstraint;

  constructor(private afAuth: AngularFireAuth, private router: Router,
    private db: Firestore) {

    const localUser = localStorage.getItem('user');
    let isLoggedIn: boolean = false;
    if (localUser) {
      this._user = JSON.parse(localUser) as unknown as User;
      isLoggedIn = true;
      this.isLoggedIn$.next(true);
      this.whereCurrentUserIsOwner = where('uid', '==', this._user?.uid);
      this.whereSharedWithCurrentUser = where('sharedWith', 'array-contains', this._user?.uid)
      this.whereCurrentUserIsAllowed = or(this.whereCurrentUserIsOwner, this.whereSharedWithCurrentUser);
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

  getUser(): Observable<HomeUpkeepUser> {
    const userRef = doc(this.db, `users/${this.user!.uid}`);
    return docData(userRef) as Observable<HomeUpkeepUser>;
  }

  getUsers(): Observable<HomeUpkeepUser[]> {
    const usersRef = collection(this.db, 'users');
    return collectionData(usersRef) as Observable<HomeUpkeepUser[]>;
  }

  saveUser(user: HomeUpkeepUser): Observable<void> {
    return from(setDoc(doc(this.db, `users/${user.uid}`), user));
  }

  saveUserOnSignup(user: User): Observable<void> {
    return from(setDoc(doc(this.db, `users/${user.uid}`), this.convertToFirestoreUser(user)));
  }

  getSharedWith(): string[] {
    return flatten(USER_GROUPS.filter((val: string[]) => val.includes(this._user!.uid)));
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
