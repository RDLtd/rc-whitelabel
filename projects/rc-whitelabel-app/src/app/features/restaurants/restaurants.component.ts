import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { AppConfig } from '../../app.config';
import { LocationService } from '../../core/location.service';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class RestaurantsComponent implements OnInit {

  isLoaded = false;
  loadText: string;
  showFilterOptions = false;
  filtersOn = false;
  // url params
  routeFilter: any;
  routeSort: any;
  // filters
  landmarks: any[] = [];
  cuisines: any[] = [];
  features: any[] = [];
  // restaurant results
  restaurants: any[] = [];
  nextRestaurants: any[] = [];
  // User location
  userPosition: any | undefined;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    public data: DataService,
    public config: AppConfig,
    private location: LocationService
  ) {
    this.loadText = this.config.i18n.Loading_data;
  }

  ngOnInit(): void {

    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      // console.log('Param changed', params);
      this.routeFilter = params.get('filter');
      this.routeSort = params.get('sort');
      // Get restaurants
      this.loadRestaurants();
    });

    // load summary for filter/sort options
    this.data.loadSummarisedData().then((res: any) => {
      // console.log('Summary loaded', res);
      this.landmarks = res.landmarks;
      this.cuisines = res.cuisines;
      this.features = res.features;
    });

    // Observe user position
    this.location.userLocationObs.subscribe((userPos) => {
      console.log(userPos);
      this.userPosition = userPos;
    });
  }

  // Load restaurants based on search params
  loadRestaurants(prefetch: boolean = false): void {
    const params = this.getSearchParams();
    // console.log('Search Params', params);
    this.data.loadRestaurantsByParams(params)
      .then((res: any) => {
        // Delay the filter options until results have loaded
        setTimeout(() => { this.showFilterOptions = true; }, 1500);
        if (prefetch) {
          this.nextRestaurants = res;
        } else {
          this.restaurants = res;
          this.isLoaded = true;
          if (!this.restaurants.length) {
            this.router.navigate(['/']).then();
            return;
          }
          // If the last batch of results was our max limit
          // assume there are more, so prefetch the next batch
          if (res.length === this.config.resultsBatchTotal) {
           this.loadMoreRestaurants();
          }
        }
      });
  }

  // Prefetch the next batch of restaurants
  loadMoreRestaurants(): void {
    if (this.nextRestaurants.length) {
      // Extend the array
      this.restaurants.push(...this.nextRestaurants);
      // Reset
      this.nextRestaurants = [];
    }
    this.loadRestaurants(true);
  }

  // Return a search parameter object
  getSearchParams(sort?: string, cuisine?: string): any {
    this.loadText = this.config.i18n.Loading_data;
    // Initialise object
    const options: {[key: string]: any } = {
      offset: this.restaurants.length,
      limit: this.config.resultsBatchTotal
    };
    // Add geo coords
    if (this.routeSort || sort) {
      const coords = this.routeSort.split(':');
      options.lat = coords[0];
      options.lng = coords[1];
      this.loadText = this.config.i18n.Sort_by_location;
      this.filtersOn = true;
    }
    // Add filter
    if ( this.routeFilter || cuisine ) {
      options.filter = 'cuisine';
      options.filterText = this.routeFilter || cuisine;
      // Set text for loader
      // Refreshing the page has issues loading
      // the i18n so make sure we have it first
      if (!!this.config.i18n.Filtered_by) {
        this.loadText = this.config.i18n.Filtered_by + ': ' + options.filterText;
      }
      this.filtersOn = true;
    }
    return options;
  }

  // Sort and filter dialog
  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.data.getCuisines(),
        landmarks: this.data.getLandmarks(),
        userPosition: this.userPosition
      },
      panelClass: 'rd-filter-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.isLoaded = false;
      // console.log('Result', result);
      if (!!result) {
        if (result.type === 'filter') {
          this.routeFilter = result.value;
          this.router.navigate(['/restaurants', result.value]).then();
        } else if (result.type === 'sort') {
          this.routeSort = `${result.lat}:${result.lng}`;
          this.router.navigate(['/restaurants/nearest', this.routeSort]).then();
        }
      } else {
        this.isLoaded = true;
      }
    });
  }

  // If we have multiple cuisine types
  // or multiple POIs show filter options
  showFilterBtn(): void {
    if (this.cuisines.length > 1 || this.landmarks.length) {
      this.showFilterOptions = true;
    } else {
      console.log('No filters available');
    }
  }
  clearFilters(): void {
    this.router.navigate(['/restaurants']).then();
    this.filtersOn = false;
    this.showFilterOptions = false;
    this.showFilterBtn();
  }
  // Launch SPW in new window/tab
  // and and add to recently viewed
  openSPW(restaurant: any): void {
    // console.log(restaurant);
    this.data.setRecentlyViewed(restaurant);
    window.open(restaurant.restaurant_spw_url, '_target');
  }

  // Todo: we need to store on the Cloudinary ids so that
  //  we an appropriately sized & formatted image
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }
}
