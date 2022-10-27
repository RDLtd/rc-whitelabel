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

  geoTarget!: {
    label: string | null;
    lat: number;
    lng: number;
    coords: string;
  }
  cuisineFilter?: string | null;

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

  channelSite: any;

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

  set searchParams(params: any) {
    this.params = { ...this.params, ...params};
    console.log('Set searchParams', this.params);
  }

  get site(): any {
    return this.channelSite;
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

  set filter(filter: string | null) {
    this.cuisineFilter = filter;
  }

  set geo(geo: any) {
    this.geoTarget = geo;
  }
  get geo(): object {
    return this.geoTarget;
  }
  get coords(): string {
    return this.geoTarget.coords;
  }
  set coords( coords) {
    this.geoTarget.coords = coords;
    console.log('SET', this.geoTarget.coords);
  }
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

  resetSearchFilters(): void {
    this.params.filter = '';
    this.params.filterText = '';

  }

  resetRestaurantResults(): void {
    this.restaurantsSubject.next([]);
  }

  resetRestaurantsSubject(): void {
    this.restaurantsSubject.next([]);
    this.restaurantsArray = [];
  }

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
        console.log('Landmarks', this.landmarks);
        console.log('Cuisines', this.cuisines);
        console.log('Features', this.features);
        console.log('Total restaurants', this.totalRestaurants);
      });
  }

  loadRestaurantBatch(params: any = this.params ): void {

    console.log('loadRestaurantBatch', params);

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(false);

    // if the params are all the same, there's no point in reloading
    // if (params === this.params) {
    //   console.log('No param change');
    //   return;
    // }

    // store the current params for comparison
    this.params = {...this.params, ...params};

    console.log(this.params);

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

        // this.restaurantsArray = data.restaurants;
        this.restaurantsArray.push(...data.restaurants);

        // update subject
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // console.log('Restaurant loaded', this.restaurantsSubject.getValue());
        // notify observers
        this.resultsLoadedSubject.next(true);
      });
  }

  // loadChannelRestaurants(id: number ): void {
  //   console.log(id);
  //   // show loader if it's an initial load, but not on preload
  //   this.resultsLoadedSubject.next(false);
  //
  //   this.api.getChannelRestaurants(id, this.accessCode, this.apiKey)
  //     .subscribe((data: any) => {
  //       console.log(data.restaurants);
  //       // store the total
  //
  //       this.restaurantsArray = data.restaurants;
  //       this.totalResults = this.restaurantsArray.length;
  //       // update subject
  //       this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
  //       // console.log('Restaurant loaded', this.restaurantsSubject.getValue());
  //       // notify observers
  //       this.resultsLoadedSubject.next(true);
  //     });
  // }

  /**
   * Updates the results observable
   * @param params - an object containing the search query params
   * @param preload - false if it's a new search, true if we're preloading
   */
  loadRestaurants(params: any, preload = false): void {

    console.log('loadRestaurants', this.restaurantsArray);

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(preload);
    this.moreRestaurantsSubject.next(false);

    // if the params are all the same, there's no point in reloading
    // if (params === this.params) { return; }

    // store the current params for comparison
    this.params = {...this.params, ...params};

    // console.log('Params', this.params);

    // call api
    this.api.getRestaurantsByParamsFast( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {

        // console.log(data);

        // if we are only preloading results for our 'Load More' option
        if (preload) {
          if(data === null) { return } // abort
          this.moreRestaurantsArray = data.restaurants;
          console.log('Next preloaded ready', data.restaurants.length);
          // update subject & notify observers
          this.moreRestaurantsSubject.next(true);
          this.resultsLoadedSubject.next(true);
          return;
        }

        this.restaurantsArray = data.restaurants;

        // update subject
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // console.log('Restaurant loaded', this.restaurantsSubject.getValue());

        // notify observers
        this.resultsLoadedSubject.next(true);

        // preload next batch of results
        if (this.restaurantsArray.length < this.totalRestaurants) { this.loadMoreRestaurants(); }

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

  // loadChannelSite(id: number): Observable<any> {
  //   return this.api.getChannelSite(id, this.accessCode, this.apiKey);
  // }
}

