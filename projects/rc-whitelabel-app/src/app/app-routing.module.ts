import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'browse'
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'browse',
    loadChildren: () => import('./features/browse/browse.module').then(m => m.BrowseModule) },
  {
    path: 'results',
    loadChildren: () => import('./features/results/results.module').then(m => m.ResultsModule) },
  {
    path: '**',
    redirectTo: 'browse'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
