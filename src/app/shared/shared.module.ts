import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { LoaderComponent } from '../core/layout/loader/loader.component';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  imports: [
    // Vendor
    CommonModule,
    RouterModule,
    MatIconModule,
    MatDialogModule
  ],
  exports: [
    // Vendor
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    LoaderComponent
  ]
})
export class SharedModule { }
