import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RestaurantsComponent } from './restaurants.component';
import { RestaurantsMapComponent } from './restaurants-map.component';
import { ListViewComponent } from './list-view.component';

const routes: Routes = [
  { path: '', component: RestaurantsComponent },
  { path: ':geo/map', component: RestaurantsMapComponent },
  { path: ':geo/list', component: ListViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule { }
