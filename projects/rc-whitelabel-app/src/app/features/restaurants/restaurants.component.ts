import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { AppConfig } from '../../app.config';
import { LocationService } from '../../core/location.service';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  isLoaded = false;
  currentLocation: any | undefined;
  currentDistance: number | undefined;
  // filters
  showFilterOptions = false;
  filtersOn = false;
  routeFilter: any;
  routeSort: any;
  landmarks: any[] = [];
  cuisines: any[] = [];
  features: any[] = [];
  // Results
  restaurants: any[] = [];
  cachedRestaurants: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    public data: DataService,
    public config: AppConfig,
    private location: LocationService
  ) { }

  ngOnInit(): void {

    // Check for sort/filtering
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      // console.log('Param changed', params);
      this.routeFilter = params.get('filter');
      this.routeSort = params.get('sort');
      // load restaurants
      this.data.loadRestaurants().then((res: any) => {
        // console.log(res);
        this.cachedRestaurants = res;
        // Apply sort/filter
        this.updateRestaurantResults();
      });
    });

    // load summary for filter/sort options
    this.data.loadSummarisedData().then((res: any) => {
      // console.log('Summary loaded', res);
      this.landmarks = res.landmarks;
      this.cuisines = res.cuisines;
      this.features = res.features;
      this.showFilterBtn();
    });
    // Set user geo
    this.location.getUserGeoLocation().subscribe(pos => {
      this.currentLocation = pos;
      console.log(this.currentLocation);
      this.currentDistance = this.location.getDistance(
        this.config.channelLat,
        this.config.channelLng,
        this.currentLocation.coords.latitude,
        this.currentLocation.coords.longitude
      );
    });
  }
  // Check for route params
  updateRestaurantResults(sort?: string, filter?: string): void {

    this.isLoaded = false;

    if (this.routeSort || sort) {
      const coords = this.routeSort.split(':');
      console.log('Sort distance:', coords);
      this.restaurants = this.sortByDistance(coords[0], coords[1]);
      this.filtersOn = true;

    } else if ( this.routeFilter || filter ) {
      this.restaurants = this.cachedRestaurants;
      this.restaurants = this.filterByCuisine(this.routeFilter);
      this.filtersOn = true;

    } else {
      this.restaurants = this.cachedRestaurants;
      this.restaurants = this.sortByDistance(this.config.channelLat, this.config.channelLng);
    }
  }

  filterByCuisine(cuisine: string): any {
    let i = this.restaurants.length; let r;
    const filteredRests = [];
    while (i--) {
      r = this.restaurants[i];
      if (r.restaurant_cuisine_1.toUpperCase().includes(cuisine.toUpperCase())) {
        filteredRests.push(r);
      }
    }
    this.restaurants = filteredRests;
    this.isLoaded = true;
    return filteredRests;
  }

  sortByDistance(lat: number, lng: number): any[] {
    const sortedRestaurants = this.cachedRestaurants;
    let i = sortedRestaurants.length; let s;
    while (i--) {
      s = sortedRestaurants[i];
      s.distance = this.location.getDistance(s.restaurant_lat, s.restaurant_lng, lat, lng);
    }
    sortedRestaurants.sort((a, b) => {
      return a.distance - b.distance;
    });
    // console.log('Dist:', sortedRestaurants);
    this.isLoaded = true;
    return sortedRestaurants;
  }

  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.data.getCuisines(),
        landmarks: this.data.getLandmarks(),
        currentLocation: this?.currentLocation,
        currentDistance: this?.currentDistance
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.isLoaded = false;
      // console.log('Result', result);
      if (!!result) {
        if (result.type === 'filter') {
          this.routeFilter = result.value;
          this.router.navigate(['/restaurants', result.value]);
        } else if (result.type === 'sort') {
          this.routeSort = `${result.lat}:${result.lng}`;
          this.router.navigate(['/restaurants/nearest', this.routeSort]);
        }
        // this.filtersOn = true;
      } else {
        this.isLoaded = true;
      }
    });
  }

  showFilterBtn(): void {
    if (this.cuisines.length > 1 || this.landmarks.length) {
      this.showFilterOptions = true;
    } else {
      console.log('No filters available');
    }
  }

  clearFilters(): void {
    this.router.navigate(['/restaurants']);
    this.filtersOn = false;
    this.showFilterOptions = false;
    this.showFilterBtn();
  }

  openSPW(restaurant: any): void {
    // Add to recents
    console.log(restaurant);
    this.data.setRecentlyViewed(restaurant);
    window.open(restaurant.restaurant_spw_url, '_target');
  }

  // Todo: we need to store on the Cloudinary ids so that
  //  we con apply whatever responsive formatting is needed
  //  then we won't need to do this
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }

}
