import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RestaurantsComponent } from './restaurants.component';
import { MapViewComponent } from './map-view.component';
import { ListViewComponent } from './list-view.component';

const routes: Routes = [
  { path: '', component: RestaurantsComponent },
  { path: ':geo/map', component: MapViewComponent },
  { path: ':geo/list', component: ListViewComponent },
  {
    path: ':geo',
    redirectTo: ':geo/map'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule { }
