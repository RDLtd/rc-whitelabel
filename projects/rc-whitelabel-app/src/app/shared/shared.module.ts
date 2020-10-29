import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    // Vendor
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    // Vendor
    CommonModule,
    RouterModule,
    MatIconModule
  ]
})
export class SharedModule { }
