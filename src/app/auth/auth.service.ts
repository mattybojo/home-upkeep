import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, UserCredential, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import {
  Firestore,
  QueryCompositeFilterConstraint,
  QueryFieldFilterConstraint,
  collection, collectionData, doc, docData, or, setDoc, where
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { flatten } from 'lodash';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { USER_GROUPS } from '../app.config';
import { AuthProvider, HomeUpkeepUser } from './auth.beans';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _auth: Auth = inject(Auth);

  private _user: User | null = null;

  get user() {
    return this._user;
  }

  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Where clauses
  whereCurrentUserIsOwner!: QueryFieldFilterConstraint;
  whereSharedWithCurrentUser!: QueryFieldFilterConstraint;
  whereCurrentUserIsAllowed!: QueryCompositeFilterConstraint;

  constructor(private router: Router,
    private db: Firestore) {

    const localUser = localStorage.getItem('user');
    let isLoggedIn: boolean = false;
    if (localUser) {
      this._user = JSON.parse(localUser) as unknown as User;
      isLoggedIn = true;
      this.isLoggedIn$.next(true);
      this.whereCurrentUserIsOwner = where('uid', '==', this._user!.uid);
      this.whereSharedWithCurrentUser = where('sharedWith', 'array-contains', this._user!.uid)
      this.whereCurrentUserIsAllowed = or(this.whereCurrentUserIsOwner, this.whereSharedWithCurrentUser);
    }

    this._auth.onAuthStateChanged({
      next: (user: User | null) => {
        this._user = user;

        if (!isLoggedIn) {
          this.isLoggedIn$.next(!!user);
        }

        if (!!user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.whereCurrentUserIsOwner = where('uid', '==', this._user!.uid);
          this.whereSharedWithCurrentUser = where('sharedWith', 'array-contains', this._user!.uid)
          this.whereCurrentUserIsAllowed = or(this.whereCurrentUserIsOwner, this.whereSharedWithCurrentUser);
        } else {
          localStorage.removeItem('user');
        }
      },
      complete: () => { },
      error: () => { }
    });
  }

  ngOnInit(): void { }

  signIn(email: string, password: string, isNew: boolean, authProvider: AuthProvider): void {
    let provider;
    if (isNew) {
      // Register new user
      createUserWithEmailAndPassword(this._auth, email, password).then(() => {
        this.router.navigateByUrl('/');
      }).catch(err => console.log(err));
    } else if (authProvider) {
      switch (authProvider) {
        case 'google':
          provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          signInWithPopup(this._auth, provider).then(() => {
            this.router.navigateByUrl('/');
          }).catch(err => console.log(err));;

      }
    } else {
      signInWithEmailAndPassword(this._auth, email, password).then((userCredential: UserCredential) => {
        this.router.navigateByUrl('/');
      }).catch(err => console.log(err));;
    }
  }

  resetPassword(email: string): void {
    sendPasswordResetEmail(this._auth, email).then(() => {
    }).catch(err => console.log(err));
  }

  logout() {
    this._auth.signOut().then(() => {
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
