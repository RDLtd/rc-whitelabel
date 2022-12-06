import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { ApiService } from '../core/api.service';
import { AppConfig } from '../app.config';
import { DataService } from '../core/data.service';
import { AnalyticsService } from '../core/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { SearchFormComponent } from './search/search-form.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})

export class RestaurantsService {
  // default search params
  params = {
    filter: '',
    filterText: '',
    lat: this.config.channel.latitude,
    lng: this.config.channel.longitude,
    limit: 10,
    boundary: this.config.channel.boundary || 10,
    offset: 0,
    testing: false,
    location: ''
  };
  // Geo data
  geoTarget!: {
    label: string | null;
    lat: number;
    lng: number;
  }

  cuisines?: any[];
  features?: any[];
  landmarks?: any[];

  private readonly apiKey: string;
  private readonly accessCode: string;

  private resultsLoadedSubject = new BehaviorSubject<boolean>(false);
  private moreRestaurantsArray: Array<any> = [];
  private moreRestaurantsSubject = new BehaviorSubject<boolean>(false);
  private restaurantsArray: Array<any> = [];
  private restaurantsSubject = new BehaviorSubject<any[]>(this.restaurantsArray);

  // channelSite: any;

  private totalResults = 0;

  constructor(
    private route: ActivatedRoute,
    private ga: AnalyticsService,
    private config: AppConfig,
    private api: ApiService,
    private dialog: MatDialog,
    private data: DataService) {
      this.apiKey = this.config.channel.apiKey;
      this.accessCode = this.config.channel.accessCode;
  }

  openSpw(restaurant: any, cat: string): void {
    this.data.setRecentlyViewed(restaurant);
    this.ga.eventEmitter(
      'page_view_spw',
      cat,
      'open_spw', `spw/${restaurant.restaurant_name.replace(/\s/g , "-")}`,
      0);
    window.open(restaurant.restaurant_spw_url, '_target');
  }

  // SEARCH PARAMS
  set searchParams(params: any) {
    this.params = { ...this.params, ...params};
  }
  get searchParams(): any {
    return this.params;
  }
  get searchFilterOn(): boolean {
    return !!this.params.filterText;
  }

  // GEO TARGET
  set geo(geo: any) {
    this.geoTarget = {...this.geo, ...geo};
  }
  get geo(): object {
    return this.geoTarget;
  }
  get geoLatitude(): number {
    return Number(this.geoTarget.lat);
  }
  get geoLongitude(): number {
    return Number(this.geoTarget.lng);
  }
  get geoLabel(): string | null {
    return this.geoTarget.label;
  }
  get geoCoords(): string {
    return `${this.geoTarget.lat},${this.geoTarget.lng}`;
  }

  // RESULTS
  set totalRestaurants(n) {
    this.totalResults = n;
  }
  get totalRestaurants(): number {
    return this.totalResults;
  }
  get cuisineSummary(): any[] {
    return this.cuisines || [];
  }
  get landmarkSummary(): any[] {
    return this.landmarks || [];
  }
  resetRestaurantResults(): void {
    this.restaurantsSubject.next([]);
  }
  resetRestaurantsSubject(): void {
    this.restaurantsSubject.next([]);
    this.restaurantsArray = [];
  }
  get resultsLoaded(): Observable<boolean> {
    return this.resultsLoadedSubject.asObservable();
  }
  get moreRestaurantResults(): Observable<boolean> {
    return this.moreRestaurantsSubject.asObservable();
  }
  get restaurants(): Observable<any[]> {
    return this.restaurantsSubject.asObservable();
  }
  get restArray(): Array<any> {
    return this.restaurantsArray;
  }

  /**
   * A summary of the available restaurants to
   * a channel or filtered channel
   * @param lat
   * @param lng
   * @param boundary
   */
  loadSummarisedResults(
    lat: number = this.params.lat,
    lng: number = this.params.lng,
    boundary: number = this.params.boundary): void {
    console.log('loadSummarisedResults', lat, lng, boundary);
    this.data.loadResultsSummary(lat, lng, boundary)
      .then((res) => {
        this.cuisines = res.cuisines;
        this.features = res.attributes;
        this.landmarks = res.landmarks;
        this.totalRestaurants = res.restaurants?.length;
      })
      .then(() => {
        // If a filter has been applied
        // update the total results accordingly
        if (!!this.params.filter) {
          const cuisine = this.cuisines?.find((obj: any) => {
            return obj.Cuisine === this.params.filterText;
          });
          this.totalRestaurants = cuisine.Count;
        }
      });
  }

  /**
   * Add a batch (defined by offset = limit) to
   * the results array
   * @param params
   * @param init
   */
  loadRestaurantBatch(params: any = {}, init: boolean = false): void {

    console.log('loadRestaurantBatch');

    // Show loader
    this.resultsLoadedSubject.next(false);

    // Merge params
    this.params = {...this.params, ...params};

    // console.log(this.params);
    if (init) {
      console.log('`Init`', this.params);
      this.restaurantsArray.length = 0;
    }

    this.data.loadRestaurantResults( this.accessCode, this.apiKey, this.params)
      .then((res) => {
        console.log(res);
        if (res === null || res === undefined) {
          console.log('No data', this.restaurantsArray.length);
          // this.restaurantsArray = [];
          // this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
          this.resultsLoadedSubject.next(true);
          return;
        }

        // Add loaded batch to array
        console.log(this.restaurantsArray);

        // Add loaded batch to array
        this.restaurantsArray.push(...res.restaurants);

        // Notify observers
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));

        // Complete the load sequence
        this.resultsLoadedSubject.next(true);
      });
  }

  /**
   * Updates the results observable
   * @param params - an object containing the search query params
   * @param preload - false if it's a new search, true if we're preloading
   */
  loadRestaurants(params: any = {}, preload = false): void {

    console.log('loadRestaurants', params);

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(preload);
    this.moreRestaurantsSubject.next(false);

    // Update params
    this.params = {...this.params, ...params};

    // console.log(params);

    this.data.loadRestaurantResults( this.accessCode, this.apiKey, this.params)
      .then((res) => {
        console.log(res);
        // Is this just a preload call
        if (preload) {
          if(res === null) { return } // abort
          this.moreRestaurantsArray = res.restaurants;
          console.log('Next preloaded ready', res.restaurants.length);
          // update subject & notify observers
          this.moreRestaurantsSubject.next(true);
          this.resultsLoadedSubject.next(true);
          // abort at this point
          return;
        }
        // Update restaurant results
        this.restaurantsArray = res.restaurants;
        // Update subject
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // Notify observers
        this.resultsLoadedSubject.next(true);
        // Preload next batch
        if (this.restaurantsArray.length < this.totalRestaurants) {
          this.loadMoreRestaurants();
        }
      });
  }

  /**
   *
   * Preloads the next batch of results
   */
  loadMoreRestaurants(): void {
    console.log('Load more!');
    // have they already been preloaded?
    if (this.moreRestaurantsArray.length) {
      // extend the array
      this.restaurantsArray.push(...this.moreRestaurantsArray);
      // notify observers
      this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
      // reset array
      this.moreRestaurantsArray = [];
      // are there more results?
      this.moreRestaurantsSubject.next(this.restaurantsArray.length < this.totalResults);
    }
    // are there more results to load?
    if (this.restaurantsArray.length < this.totalResults) {
      this.loadRestaurants({ offset: this.restaurantsArray.length }, true);
    } else {
      console.log(`All ${this.totalResults} results loaded`)
    }
  }

  openSearchForm(): void {
    const dialogRef = this.dialog.open(SearchFormComponent, {
      position: {'top': '19vh'},
      backdropClass: 'rd-backdrop',
      panelClass: 'rd-search-dialog'
    });
  }
}
