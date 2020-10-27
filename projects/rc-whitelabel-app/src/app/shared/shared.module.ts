import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HideableHeaderModule } from 'ngx-hideable-header';

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
    MatIconModule,
    HideableHeaderModule
  ]
})
export class SharedModule { }
