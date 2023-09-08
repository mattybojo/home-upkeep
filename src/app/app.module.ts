import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import * as firebaseui from 'firebaseui';
import { FirebaseUIModule } from 'firebaseui-angular';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule as PrimeNgSidebarModule } from 'primeng/sidebar';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { firebaseUiConfig } from './app.config';
import { SidebarModule as AppSidebarModule } from './sidebar/sidebar.module';

const firebaseUiAuthConfig: firebaseui.auth.Config = firebaseUiConfig;

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MenubarModule,
    RouterModule,
    DropdownModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AngularFireModule.initializeApp(environment.firebase),
    PrimeNgSidebarModule,
    AppSidebarModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
