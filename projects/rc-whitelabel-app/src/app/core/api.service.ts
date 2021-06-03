import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http: HttpClient,
              private config: AppConfig) {
  }

  // tslint:disable-next-line:variable-name
  getChannelByDomain(channel_domain: string): any {
    return this.http.post(this.config.apiUrl + '/channel/domain',
      {channel_domain});
  }

  // tslint:disable-next-line:variable-name
  getChannelLanguage(channel_access_code: string, channel_access_api_key: string, language: string): any {
    return this.http.post(this.config.apiUrl + '/channel/language',
      {channel_access_code, channel_access_api_key, language});
  }


  // Restaurant Detail
  // tslint:disable-next-line:variable-name
  getRestaurant(channel_access_code: string, channel_access_api_key: string, restaurant_number: string,
                lat: number, lng: number): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurant',
      {channel_access_code, channel_access_api_key, restaurant_number, lat, lng, testing: this.config.testMode});
  }

  // Restaurants
  // tslint:disable-next-line:variable-name
  getRestaurantsByParams(channel_access_code: string, channel_access_api_key: string, params: any): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants/parameters',
      {
        channel_access_code,
        channel_access_api_key,
        params
      });
  }

  // tslint:disable-next-line:variable-name
  getRestaurantsFilter(channel_access_code: string, channel_access_api_key: string, params: object): any {
    // console.log('Params:', params);
    return this.http.post(this.config.apiUrl + '/channel/restaurants/filter',
      {channel_access_code, channel_access_api_key, params});
  }

  // tslint:disable-next-line:variable-name
  getRestaurantsSummary(channel_access_code: string, channel_access_api_key: string,
                        lat: number, lng: number): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants/summary',
      {channel_access_code, channel_access_api_key, lat, lng, testing: this.config.testMode});
  }

  // tslint:disable-next-line:variable-name
  getRests(channel_access_code: string, channel_access_api_key: string, params: object): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants/filter',
      {channel_access_code, channel_access_api_key, params}).toPromise();
  }
}
