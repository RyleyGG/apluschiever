// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { SignInPageComponent } from './pages/signin/signin.page.component';
import { LandingPageComponent } from './pages/landing/landing.page.component';
import { SignUpPageComponent } from './pages/signup/signup.page.component';
import { SignOutPageComponent } from './pages/signout/signout.page.component';
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent, SignInPageComponent, LandingPageComponent, SignUpPageComponent, SignOutPageComponent],
  imports: [
    CardModule, ReactiveFormsModule, HttpClientModule, ToastModule, BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
