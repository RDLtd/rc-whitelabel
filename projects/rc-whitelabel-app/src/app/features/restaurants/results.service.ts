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
    filter: null,
    filterText: null,
    lat: '51.34782520416091',
    limit: 12,
    lng: '-0.173759097850969',
    offset: 0,
    testing: true
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
