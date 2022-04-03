import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ApiService} from '../../core/api.service';
import {AppConfig} from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  restaurants = new BehaviorSubject<any[]>([]);
  params = {
    filter: '',
    filterText: '',
    lat: '51.7521849865759',
    limit: 8,
    lng: '-1.2579775767154544',
    offset: 0,
    testing: false
  };

  constructor(
    private config: AppConfig,
    private api: ApiService) { }

  // setRestaurants(restaurant: any[]) {
  //   this.restaurants.next(restaurant);
  // }


  getRestaurants(): Observable<any[]> {
    // only if length of array is 0, load from server
    if (this.restaurants.getValue().length === 0) {
      console.log('Loading restaurants from api');
      this.loadRestaurants();
    } else {
      console.log('Loading from cache');
    }
    return this.restaurants.asObservable();
  }

  private loadRestaurants(): void {
    this.api.getRestaurantsByParams(
      this.config.channel.accessCode,
      this.config.channel.apiKey,
      this.params)
      .subscribe((res: any) => {
        console.log('Restaurants Loaded');
        this.restaurants.next(Object.assign([], res.restaurants.sort()));
      });
  }
}
