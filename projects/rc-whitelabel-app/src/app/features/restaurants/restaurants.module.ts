import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { SharedModule } from '../../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MapViewComponent } from './map-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ListViewComponent } from './list-view.component';
import { FilterBtnComponent } from './filter-btn.component';

@NgModule({
  declarations: [
    RestaurantsComponent,
    FilterOptionsDialogComponent,
    MapViewComponent,
    ListViewComponent,
    MapViewComponent,
    FilterBtnComponent],
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
