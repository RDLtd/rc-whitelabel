import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { SharedModule } from '../../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [RestaurantsComponent, FilterOptionsDialogComponent],
  imports: [
    SharedModule,
    RestaurantsRoutingModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class RestaurantsModule { }
