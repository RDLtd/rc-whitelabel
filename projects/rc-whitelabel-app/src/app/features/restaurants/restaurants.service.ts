import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AppConfig } from '../../app.config';
import { DataService } from '../../core/data.service';
import { AnalyticsService } from '../../core/analytics.service';
import { ActivatedRoute } from '@angular/router';

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
  cuisineFilter?: string | null;

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
  set searchFilter(filter: string | null) {
    this.cuisineFilter = filter;
  }
  get searchFilterOn(): boolean {
    return !!this.searchParams.filterText;
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
    return this.geoTarget.label
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
        this.totalRestaurants = res.restaurants.length;
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
   */
  loadRestaurantBatch(params: any = this.params ): void {

    console.log('loadRestaurantBatch', params);

    // show loader if it's an initial load, but not on preload
    // as that happens in the background
    this.resultsLoadedSubject.next(false);

    // Update params
    this.params = {...this.params, ...params};

    this.api.getRestaurantsByParamsFast( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        // console.log(data);
        if (data === null || data === undefined) {
          console.log('No data', this.restaurantsArray.length);
         // this.restaurantsArray = [];
         // this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
          this.resultsLoadedSubject.next(true);
          return;
        }
        // Add loaded batch to array
        this.restaurantsArray.push(...data.restaurants);
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
  loadRestaurants(params: any = this.searchParams, preload = false): void {

    console.log('loadRestaurants', this.restaurantsArray);

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(preload);
    this.moreRestaurantsSubject.next(false);

    // Update params
    this.params = {...this.params, ...params};

    // Get results
    this.api.getRestaurantsByParamsFast( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        // Is this just a preload call
        if (preload) {
          if(data === null) { return } // abort
          this.moreRestaurantsArray = data.restaurants;
          console.log('Next preloaded ready', data.restaurants.length);
          // update subject & notify observers
          this.moreRestaurantsSubject.next(true);
          this.resultsLoadedSubject.next(true);
          // abort at this point
          return;
        }
        // Update restaurant results
        this.restaurantsArray = data.restaurants;
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
}

