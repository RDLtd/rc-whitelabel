import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PartnerHeaderComponent } from './layout/partner-header/partner-header.component';
import { FooterComponent } from './layout/footer/footer.component';

@NgModule({
  declarations: [MainLayoutComponent, PartnerHeaderComponent, FooterComponent],
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
    MatButtonModule
  ]
})
export class CoreModule { }
