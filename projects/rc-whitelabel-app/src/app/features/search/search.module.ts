import { NgModule } from '@angular/core';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    SharedModule,
    SearchRoutingModule,
    MatButtonModule
  ]
})
export class SearchModule { }
