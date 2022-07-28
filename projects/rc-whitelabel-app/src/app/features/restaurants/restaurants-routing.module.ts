import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapViewComponent } from './map-view.component';
import { ListViewComponent } from './list-view.component';


/**
 * location = geocodes 'lat,lng' for channel type 'landmarks'
 * or site_id for type 'sites'
 */
const routes: Routes = [
  { path: 'map/:id', component: MapViewComponent },
  { path: 'map/:id/:name', component: MapViewComponent },
  { path: 'list/:id', component: ListViewComponent },
  { path: 'list/:id/:filter', component: ListViewComponent },
  {
    path: '*',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule { }
