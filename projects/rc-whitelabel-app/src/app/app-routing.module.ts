import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'restaurants',
    loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  },
  {
    path: 'restaurants/:filter',
    loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  },
  {
    path: 'restaurants/nearest/:filter',
    loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  },
  {
    path: '**',
    redirectTo: 'search'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'top'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
