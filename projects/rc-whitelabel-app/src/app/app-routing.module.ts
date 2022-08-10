import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  // {
  //   path: 'search',
  //   loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  // },

  {
    path: 'restaurants',
    loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  },
  // {
  //   path: 'restaurants/:filter',
  //   loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  // },
  // {
  //   path: 'restaurants/nearest/:sort',
  //   loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  // },
  // {
  //   path: 'restaurants/:geo/:sort',
  //   loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  // },
  // {
  //   path: 'restaurants/:geo/',
  //   loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  // },
  { path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
