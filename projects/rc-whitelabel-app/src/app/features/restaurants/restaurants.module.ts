import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { SharedModule } from '../../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RestaurantsMapComponent } from './restaurants-map.component';
import { GoogleMapsModule } from '@angular/google-maps';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    RestaurantsComponent,
    FilterOptionsDialogComponent,
    RestaurantsMapComponent],
  imports: [
    SharedModule,
    RestaurantsRoutingModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule
  ]
})
export class RestaurantsModule { }
