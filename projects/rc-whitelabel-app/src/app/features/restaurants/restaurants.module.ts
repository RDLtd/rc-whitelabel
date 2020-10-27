import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { SharedModule } from '../../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
  declarations: [RestaurantsComponent],
  imports: [
    SharedModule,
    RestaurantsRoutingModule,
    MatChipsModule
  ]
})
export class RestaurantsModule { }
