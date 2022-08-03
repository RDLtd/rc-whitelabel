import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AppConfig } from '../../app.config';
import { DataService } from '../../core/data.service';

@Injectable({
  providedIn: 'root'
})

export class RestaurantsService {

  // default search params
  params = {
    filter: '',
    filterText: '',
    lat: '',
    lng: '',
    limit: 10,
    offset: 0,
    testing: false
  };
  private resultsLoadedSubject = new BehaviorSubject<boolean>(false);
  private moreRestaurantsArray: Array<any> = [];
  private moreRestaurantsSubject = new BehaviorSubject<boolean>(false);
  private restaurantsArray: Array<any> = [];
  private restaurantsSubject = new BehaviorSubject<any[]>(this.restaurantsArray);
  channelSite: any;
  private apiKey: string;
  private accessCode: string;
  private totalResults = 0;

  constructor(
    private config: AppConfig,
    private api: ApiService,
    private data: DataService) {
      this.apiKey = this.config.channel.apiKey;
      this.accessCode = this.config.channel.accessCode;
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

  get totalRestaurants(): number {
    return this.totalResults;
  }

  resetRestaurantResults(): void {
    this.restaurantsSubject.next([]);
  }

  resetRestaurantsSubject(): void {
    this.restaurantsSubject.next([]);
  }

  loadRestaurantBatch(params: any ): void {
    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(false);

    // if the params are all the same, there's no point in reloading
    if (params === this.params) { return; }

    // store the current params for comparison
    this.params = Object.assign(this.params, params);

    this.api.getRestaurantsByParams( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        if (data === null || data === undefined) {
          console.log('No data');
          this.totalResults = 0;
          this.restaurantsArray = [];
          this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
          this.resultsLoadedSubject.next(true);
          return;
        }
        // store the total
        this.totalResults = data?.total_count;
        this.restaurantsArray = data.restaurants;
        // update subject
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // console.log('Restaurant loaded', this.restaurantsSubject.getValue());
        // notify observers
        this.resultsLoadedSubject.next(true);
      });
  }

  loadChannelRestaurants(id: number ): void {
    console.log(id);
    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(false);

    this.api.getChannelRestaurants(id, this.accessCode, this.apiKey)
      .subscribe((data: any) => {
        console.log(data.restaurants);
        // store the total

        this.restaurantsArray = data.restaurants;
        this.totalResults = this.restaurantsArray.length;
        // update subject
        this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
        // console.log('Restaurant loaded', this.restaurantsSubject.getValue());
        // notify observers
        this.resultsLoadedSubject.next(true);
      });
  }

  /**
   * Updates the results observable
   * @param params - an object containing the search query params
   * @param preload - false if it's a new search, true if we're preloading
   */
  loadRestaurants(params: any, preload = false): void {

    // show loader if it's an initial load, but not on preload
    this.resultsLoadedSubject.next(preload);
    this.moreRestaurantsSubject.next(false);

    // if the params are all the same, there's no point in reloading
    if (params === this.params) { return; }

    // store the current params for comparison
    this.params = Object.assign(this.params, params);

    // call api
    this.api.getRestaurantsByParams( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        console.log(data);

        // store the total
        this.totalResults = data.total_count;

        // if wwe are only preloading results for our 'Load More' option
        if (preload) {
          this.moreRestaurantsArray = data.restaurants;
          console.log('Next preloaded ready');
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
        if (this.restaurantsArray.length < this.totalResults) { this.loadMoreRestaurants(); }

      });

  }

  /**
   *
   * Preloads the next batch of results
   */
  loadMoreRestaurants(): void {
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

  loadChannelSite(id: number): Observable<any> {
    return this.api.getChannelSite(id, this.accessCode, this.apiKey);
  }
}

