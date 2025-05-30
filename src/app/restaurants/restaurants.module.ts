import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { FilterOptionsDialogComponent } from './filter/filter-options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MapViewComponent } from './map-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { ListViewComponent } from './list-view.component';
import { FilterBtnComponent } from './filter/filter-btn.component';
import { SearchFormComponent } from './search/search-form.component';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';

@NgModule({ declarations: [
        SearchFormComponent,
        FilterOptionsDialogComponent,
        MapViewComponent,
        ListViewComponent,
        MapViewComponent,
        FilterBtnComponent
    ],
    exports: [
        ListViewComponent
    ], imports: [SharedModule,
        FormsModule,
        RestaurantsRoutingModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        GoogleMapsModule,
        MatListModule], providers: [provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())] })
export class RestaurantsModule { }
