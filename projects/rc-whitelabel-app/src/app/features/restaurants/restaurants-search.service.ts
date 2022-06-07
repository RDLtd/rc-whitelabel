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
    limit: 24,
    lng: '-1.2579775767154544',
    offset: 0,
    testing: false
  };

  private restaurantsSubject = new BehaviorSubject<any[]>([]);
  apiKey: string;
  accessCode: string;

  constructor(
    private config: AppConfig,
    private api: ApiService) {
    this.apiKey = this.config.channel.apiKey;
    this.accessCode = this.config.channel.accessCode;
  }

  // setRestaurants(restaurant: any[]) {
  //   this.restaurants.next(restaurant);
  // }

  get restaurants(): Observable<any[]> {
    return this.restaurantsSubject.asObservable();
  }

  searchRestaurants(params: SearchParams): void {
    this.api.getRestaurantsByParams( this.accessCode, this.apiKey, this.params)
      .subscribe((data: any) => {
        console.log('Restaurant results updated', data);
        this.restaurantsSubject.next(Object.assign([], data.restaurants));
        console.log('Value', this.restaurantsSubject.getValue());
      });
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

