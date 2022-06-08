import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AppConfig } from '../../app.config';

export interface SearchParams {
  sortBy?: '';
  filterBy?: '';
  geoLocation: { lat: '51.7521849865759', lng: '-1.2579775767154544' };
  batchSize?: 10;
  offset?: 0;
  testing?: false;
}

@Injectable({
  providedIn: 'root'
})

export class RestaurantsSearchService {

  params = {
    filter: '',
    filterText: '',
    lat: '51.7521849865759',
    lng: '-1.2579775767154544',
    limit: 9,
    offset: 0,
    testing: false
  };
  private nextBatchOfRestaurants: Array<any> = [];
  private restaurantsArray: Array<any> = [];
  private restaurantsSubject = new BehaviorSubject<any[]>(this.restaurantsArray);
  private apiKey: string;
  private accessCode: string;

  constructor(
    private config: AppConfig,
    private api: ApiService) {
    this.apiKey = this.config.channel.apiKey;
    this.accessCode = this.config.channel.accessCode;
  }

  get restaurants(): Observable<any[]> {
    return this.restaurantsSubject.asObservable();
  }

  loadRestaurants(params: any, preload = false): void {
    // if the params are all the same, there's no point in reloading
    if (params === this.params) { return; }
    // store the current params
    this.params = Object.assign(this.params, params);
    // load
    this.api.getRestaurantsByParams( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        console.log(data);
        if (preload) {
          this.nextBatchOfRestaurants = data.restaurants;
          console.log('Preloaded', this.nextBatchOfRestaurants);
        } else {
          this.restaurantsArray = data.restaurants;
          // broadcast the changes
          this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
          console.log('Restaurant results updated', this.restaurantsSubject.getValue());
          // preload next batch
          if (this.restaurantsArray.length < data.total_count) {
            this.loadMoreRestaurants();
          }
        }
      });
  }

  // Prefetch the next batch of restaurants
  loadMoreRestaurants(): void {
    // have they already been preloaded?
    if (this.nextBatchOfRestaurants.length) {
      // Extend the array
      this.restaurantsArray.push(...this.nextBatchOfRestaurants);
      this.restaurantsSubject.next(Object.assign([], this.restaurantsArray));
      // Reset
      this.nextBatchOfRestaurants = [];
    }
    this.loadRestaurants({ offset: this.restaurantsArray.length }, true);
  }

  // getRestaurants(): Observable<any[]> {
  //   // only if length of array is 0, load from server
  //   if (this.restaurantsSubject.getValue().length === 0) {
  //     console.log('Loading restaurants from api');
  //     this.loadRestaurants();
  //   } else {
  //     console.log('Loading from cache');
  //   }
  //   return this.restaurantsSubject.asObservable();
  // }
  // private loadRestaurants(): void {
  //   this.api.getRestaurantsByParams(
  //     this.config.channel.accessCode,
  //     this.config.channel.apiKey,
  //     this.params)
  //     .subscribe((res: any) => {
  //       console.log('Restaurants Loaded');
  //       this.restaurantsSubject.next(Object.assign([], res.restaurants.sort()));
  //     });
  // }
}

