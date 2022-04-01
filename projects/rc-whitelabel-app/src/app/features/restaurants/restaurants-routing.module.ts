import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RestaurantsComponent } from './restaurants.component';
import { RestaurantsMapComponent } from './restaurants-map.component';

const routes: Routes = [
  { path: '', component: RestaurantsComponent },
  { path: 'map', component: RestaurantsMapComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule { }
