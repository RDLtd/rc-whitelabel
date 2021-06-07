import { NgModule } from '@angular/core';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [SearchComponent],
  exports: [
    SearchComponent
  ],
  imports: [
    SharedModule,
    SearchRoutingModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatOptionModule
  ]
})
export class SearchModule { }

