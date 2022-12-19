import { NgModule } from '@angular/core';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { FilterOptionsDialogComponent } from './filter/filter-options-dialog.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MapViewComponent } from './map-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ListViewComponent } from './list-view.component';
import { FilterBtnComponent } from './filter/filter-btn.component';
import { SearchFormComponent } from './search/search-form.component';
import { FormsModule } from '@angular/forms';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

@NgModule({
    declarations: [
        SearchFormComponent,
        FilterOptionsDialogComponent,
        MapViewComponent,
        ListViewComponent,
        MapViewComponent,
        FilterBtnComponent
    ],
    exports: [
        ListViewComponent
    ],
    imports: [
        SharedModule,
        FormsModule,
        RestaurantsRoutingModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        GoogleMapsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MatListModule
    ]
})
export class RestaurantsModule { }
