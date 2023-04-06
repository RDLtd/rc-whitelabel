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
    label: ''
  };
  // Geo data
  geoTarget!: {
    label: string | null;
    lat: number;
    lng: number;
  };

  cuisines?: any[] = [];
  features?: any[];
  landmarks?: any[];

  private readonly apiKey: string;
  private readonly accessCode: string;

  private resultsLoadedSubject = new BehaviorSubject<boolean>(false);
  private moreRestaurantsArray: Array<any> = [];
  private moreRestaurantsSubject = new BehaviorSubject<boolean>(false);
  private restaurantsArray: Array<any> = [];
  private restaurantsSubject = new BehaviorSubject<any[]>(this.restaurantsArray);
  private showFiltersSubject = new BehaviorSubject<boolean>(false);

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
      'open_spw', `spw/${restaurant.restaurant_name.replace(/\s/g , '-')}`,
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

  // GEO TARGET
  set geo(geo: any) {
    this.geoTarget = {...this.geo, ...geo};
    // console.log('RS', this.geoTarget);
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
    if (this.geoTarget.lat === undefined) {
      return `${this.config.channel.latitude},${this.config.channel.longitude}`;
    }
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
  get showCuisineFilters(): Observable<boolean> {
    return this.showFiltersSubject.asObservable();
  }
  resetRestaurantResults(): void {
    this.restaurantsSubject.next([]);
  }
  resetRestaurantsSubject(): void {
    this.restaurantsSubject.next([]);
    this.restaurantsArray = [];
  }
  resetAll(): void {
    this.resetRestaurantsSubject();
    this.resetRestaurantResults();
    this.showFiltersSubject.next(false);
    this.moreRestaurantsSubject.next(false);
  }

  /**
   * Load restaurants marked as 'featured'
   */
  loadFeaturedRestaurants(): void {
    this.data.loadFeaturedRestaurants()
      .then((res: any) => {
        // Add loaded batch to array
        this.restaurantsArray.push(...res.restaurants);
        // Notify observers
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // Complete the load sequence
        this.resultsLoadedSubject.next(true);
      })
      .catch((error: Error) => {
        console.log(`ERROR: ${error}`);
        // If there are no featured restaurants
        // launch search
        this.openSearchForm();
        // kill the loader
        this.resultsLoadedSubject.next(true);
      });
  }


  //   ks 230123 converted to other style comment to avoid linter error
  //   **
  //  * A summary of the available restaurants to a channel or filtered channel
  //  * @param lat
  //  * @param lng
  //  * @param boundary
  //  */
  loadSummarisedResults(
    lat: number = this.params.lat,
    lng: number = this.params.lng,
    boundary: number = this.params.boundary): void {
    this.showFiltersSubject.next(false);
    // console.log('loadSummarisedResults', lat, lng, boundary);
    this.data.loadResultsSummary(lat, lng, boundary)
      .then((res) => {
        // console.log('SUM:', res);
        this.cuisines = res.cuisines;
        this.features = res.attributes;
        this.landmarks = res.landmarks;
        this.totalRestaurants = res.restaurants?.length;
      })
      .then(() => {
        // Are there enough cuisine styles to warrant a filter option?
        this.showFiltersSubject.next(!!this.cuisines && this.cuisines.length > 3);
        // If a filter has been applied update the total
        // results accordingly by adding together the count
        // of each cuisine included in the filter
        if (!!this.params.filter) {
          let cuisineCount = 0;
          this.cuisines?.forEach((obj: any) => {
            if (this.params.filterText.includes(obj.Cuisine)) {
              // console.log(`Add ${obj.Count}`);
              cuisineCount += obj.Count;
            }
          });
          this.totalRestaurants = cuisineCount;
        }
      })
      .catch((error) => console.log(`ERROR: ${error}`));
  }

  // /**
  //  * Add a batch (defined by offset = limit) to
  //  * the results array
  //  * @param params
  //  * @param initialLoad
  //  */
  loadRestaurantBatch(
    params: any = {},
    initialLoad: boolean = false): void {

    // Show loader
    this.resultsLoadedSubject.next(false);

    // Merge params
    this.params = {...this.params, ...params};

    // If this is the first batch loaded, reset our array
    if (initialLoad) {
      // console.log('`Init`', this.params);
      this.restaurantsArray.length = 0;
    }

    this.data.loadRestaurantResults(this.params)
      .then((res) => {

        // if (res === null || res === undefined) {
        //   console.log('No data', this.restaurantsArray.length);
        //   this.resultsLoadedSubject.next(true);
        //   return;
        // }

        // Add loaded batch to array
        this.restaurantsArray.push(...res.restaurants);

        // Notify observers
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));

        // Complete the load sequence
        this.resultsLoadedSubject.next(true);
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
        this.resultsLoadedSubject.next(true);
    });
  }

  /**
   * Updates the results observable
   * @param params - an object containing the search query params
   * @param preload - false if it's a new search, true if we're preloading
   */
  loadRestaurants(
    params: any = {},
    preload = false): void {

    console.log('loadRestaurants', params);

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(preload);
    this.moreRestaurantsSubject.next(false);

    // merge params
    this.params = {...this.params, ...params};

    // console.log(params);

    this.data.loadRestaurantResults(this.params)
      .then((res) => {
        if (res === null) {
          throw new Error(`No restaurants returned within ${this.params.boundary}km of geocode`);
        }
        // Is this just a preload call
        if (preload) {
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
        console.log(this.restaurantsArray);
      })
      .catch((error) => console.log('ERROR:', error));
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
      console.log(`All ${this.totalResults} results loaded`);
    }
  }

  openSearchForm(): void {
    this.dialog.open(SearchFormComponent, {
      position: {top: '0'},
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'rd-dialog-backdrop',
      panelClass: 'rd-search'
    });
  }

  // getUrl(url: string, isProduction = false): string {
  //   // AWS S3 bucket domain
  //   const aws = 's3.eu-west-2.amazonaws.com';
  //   // If it's not an AWS ignore it
  //   if (url.indexOf(aws) < 0) {
  //     console.error(`${url} is not an AWS url`);
  //     return url
  //   }
  //   // remove the AWS domain
  //   let apptiserUrl = url.replace(`${aws}/`, '').trim();
  //   // For production urls we don't need the index.html ref.
  //   if (isProduction) {
  //     return apptiserUrl.replace(`index.html`, '');
  //   }
  //   return apptiserUrl;
  // }
}

