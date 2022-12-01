import { NgModule } from '@angular/core';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { SearchFormComponent } from './search-form.component';

@NgModule({
  declarations: [
    SearchComponent,
    SearchFormComponent
  ],
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

