import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule,
    CommonModule,
    HomeRoutingModule,
    SearchModule
  ]
})
export class HomeModule { }
