import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppConfig } from '../../app.config';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { RestaurantsService } from '../restaurants.service';
import { Router } from '@angular/router';
import { LocationService } from '../../core/location.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'rd-filter-btn',
  templateUrl: './filter-btn.component.html'
})
export class FilterBtnComponent implements OnInit {

  @Input() filterOn = false;
  @Input() searchFilter: any;
  @Input() view = 'list';
  @Output() onMapUpdate = new EventEmitter<number>();

  minCuisineFilters = 3; // number of cuisine options to warrant offering filters
  showFilterOptions = false;
  userPosition: any;
  geoTarget: any;
  resultsLoaded$: Observable<any>;

  constructor(
    public config: AppConfig,
    private dialog: MatDialog,
    private restService: RestaurantsService,
    private router: Router,
    private location: LocationService
  ) {
    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.searchFilter = this.restService.searchParams.filterText;
  }

  ngOnInit(): void {

    // Watch user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );

    // Current geoTarget
    this.geoTarget = this.restService.geo;

    // console.log('GEO',this.geoTarget);

    // Delay the filter options until results have loaded
    setTimeout(() => {
      this.showFilterOptions = this.restService.cuisineSummary.length > this.minCuisineFilters;
      }, 2000);
  }

  // Sort and filter dialog
  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.restService.cuisineSummary,
      },
      maxWidth: '90vw',
      panelClass: 'rd-filter-dialog'
    });

    dialogRef.afterClosed().subscribe((selected: any) => {

      // Guard clause
      if (selected === null || selected === undefined || selected.length < 1) { return;}

      // Extract the filter options that have been selected
      const cuisineFilters: string[] = [];
      selected.forEach((item: any) => {
        cuisineFilters.push(item.value);
      });

      this.router
        .navigateByUrl(
          `/restaurants/${this.view}/${this.restService.geoCoords}/${cuisineFilters.join(',')}?label=${this.geoTarget.label}`)
        .then(() => console.log(`Filtered by ${cuisineFilters}`));
      this.onMapUpdate.emit(0);
    });
  }

  clearFilters(): void {
    this.restService.searchParams = {
      lat: this.geoTarget.lat,
      lng: this.geoTarget.lng,
      filter: null,
      filterText: null,
      label: this.geoTarget.label
    }
    this.router.navigate(
      ['/restaurants', this.view, `${this.geoTarget.lat},${this.geoTarget.lng}`],
      { queryParams: { label: this.geoTarget.label }}).catch((error => console.log(error)));
  }

}
