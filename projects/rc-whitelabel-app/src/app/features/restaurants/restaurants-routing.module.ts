import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapViewComponent } from './map-view.component';
import { ListViewComponent } from './list-view.component';


/**
 * location = geocodes 'lat,lng' for channel type 'landmarks'
 * or site_id for type 'sites'
 */
const routes: Routes = [
  { path: 'map/:latLng', component: MapViewComponent },
  { path: 'map/:latLng/:name', component: MapViewComponent },
  { path: 'list/:latLng', component: ListViewComponent },
  { path: 'list/:latLng/:filter', component: ListViewComponent },
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
