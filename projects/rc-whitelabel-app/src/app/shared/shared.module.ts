import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
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
