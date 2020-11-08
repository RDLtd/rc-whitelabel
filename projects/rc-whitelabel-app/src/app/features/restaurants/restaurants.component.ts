import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataService } from '../../data.service';
import { ApiService } from '../../api.service';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  isLoaded = false;
  currentLocation: any | undefined;
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
    public config: AppConfig
  ) { }

  ngOnInit(): void {
    // Check for sort/filtering
    this.route.paramMap.subscribe((params: ParamMap) => {
      // console.log('Param changed', params);
      this.routeFilter = params.get('filter');
      this.routeSort = params.get('sort');
      // load restaurants
      this.loadRestaurants().then(() => {
        console.log('Restaurants loaded');
        this.updateRestaurantResults();
      });
    });
    // load summary
    this.loadSummary().then(() => {
      console.log('Summary loaded');
      this.showFilterBtn();
    });
    // Get geo
    this.data.getUserLocation().then((geo: any) => {
      this.currentLocation = geo;
    });
  }

  public async loadRestaurants(): Promise<any> {
    if (!this.data.getRestaurants().length) {
      const params = { testing: this.config.testing };
      const promise = await this.api.getRestaurantsFilter(this.config.channelAccessCode, this.config.channelAPIKey, params)
        .toPromise()
        .then((res: any) => {
          this.cachedRestaurants = res.restaurants;
          this.data.setRestaurants(res.restaurants);
          console.log('From API', res.restaurants);
        });
    } else {
      this.cachedRestaurants = this.restaurants = this.data.getRestaurants();
      console.log('Local', this.restaurants);
    }
  }
  public async loadSummary(): Promise<any> {
    if (!this.data.getCuisines().length) {
      const promise = await this.api.getRestaurantsSummary(this.config.channelAccessCode, this.config.channelAPIKey,
        this.config.channelLat, this.config.channelLng)
        .toPromise()
        .then((res: any) => {
          this.data.setSummary(res);
          this.landmarks = res.landmarks;
          this.features = res.attributes;
          this.cuisines = this.data.getCuisines();
        });
    } else {
      this.cuisines = this.data.getCuisines();
      this.landmarks = this.data.getLandmarks();
      this.features = this.data.getFeatures();
    }
  }
  // Check for route params
  updateRestaurantResults(sort?: string, filter?: string): void {
    if (this.routeSort || sort) {
      const coords = this.routeSort.split(':');
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
    this.isLoaded = true;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  computeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
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
    return filteredRests;
  }

  sortByDistance(lat: number, lng: number): any[] {
    const sortedRestaurants = this.cachedRestaurants;
    let i = sortedRestaurants.length; let s;
    while (i--) {
      s = sortedRestaurants[i];
      s.distance = this.computeDistance(s.restaurant_lat, s.restaurant_lng, lat, lng);
    }
    sortedRestaurants.sort((a, b) => {
      return a.distance - b.distance;
    });
    return sortedRestaurants;
  }

  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.data.getCuisines(),
        landmarks: this.data.getLandmarks(),
        coords: this.currentLocation.coords
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('Result', result);
      if (!!result) {
        if (result.type === 'filter') {
          this.routeFilter = result.value;
          this.router.navigate(['/restaurants', result.value]);
        } else if (result.type === 'sort') {
          this.routeSort = `${result.lat}:${result.lng}`;
          this.router.navigate(['/restaurants/nearest', this.routeSort]);
        }
        this.filtersOn = true;
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
    this.data.setRecentlyViewed(restaurant);
    window.open(restaurant.restaurant_spw_url, '_target');
  }

}
