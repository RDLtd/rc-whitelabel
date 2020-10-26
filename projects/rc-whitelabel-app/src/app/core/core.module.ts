import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent],
  exports: [
    MainLayoutComponent
  ],
  imports: [
    // Vendor
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CoreModule { }
