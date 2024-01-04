import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';
import { HomeUpkeepUser } from '../auth.beans';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService]
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: HomeUpkeepUser | undefined;
  userInitials: string = '';

  userForm: FormGroup | undefined;

  private subs = new SubSink();

  constructor(private authService: AuthService, private messageService: MessageService) { }

  get formattedDateCreated() {
    return this.userForm?.get('formattedDateCreated')!.value;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subs.sink = this.authService.getUser().subscribe({
      next: (user: HomeUpkeepUser) => {
        console.log(user);
        this.user = user;
        const names = user.displayName!.split(' ');
        this.userInitials = `${names[0].charAt(0)}${names.length > 1 ? names[names.length - 1].charAt(0) : ''}`;

        this.userForm = new FormGroup({
          displayName: new FormControl(user.displayName, [Validators.required]),
          email: new FormControl(user.email, [Validators.required]),
          phoneNumber: new FormControl(user.phoneNumber, null),
          photoURL: new FormControl(user.photoURL),
          formattedDateCreated: new FormControl(format(user.dateCreated, 'MMM d, y'))
        });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve user details' });
      }
    });
  }

  saveForm(): void {
    const user: HomeUpkeepUser = Object.assign(this.user!, this.userForm!.value);
    user.phoneNumber = user.phoneNumber.replace(/\D/g, '');
    delete (user as any).formattedDateCreated;
    this.subs.sink = this.authService.saveUser(user).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved user data' });
        this.userForm!.patchValue({ displayName: user.displayName, email: user.email, phoneNumber: user.phoneNumber, photoURL: user.photoURL });
        this.user!.photoURL = user.photoURL;
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save user data' });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
