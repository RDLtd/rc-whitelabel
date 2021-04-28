import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable()

export class ApiService {

  constructor(private http: HttpClient,
              private config: AppConfig) {
  }

  // Administration
  // tslint:disable-next-line:variable-name
  getChannelInfo(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.config.apiUrl + '/channel/info',
      {channel_access_code, channel_access_api_key});
  }

  // tslint:disable-next-line:variable-name
  getChannelData(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.config.apiUrl + '/channel/data',
      {channel_access_code, channel_access_api_key});
  }

  // tslint:disable-next-line:variable-name
  getChannelLogs(channel_access_code: string, channel_access_api_key: string, log_records: string): any {
    return this.http.post(this.config.apiUrl + '/channel/logs',
      {channel_access_code, channel_access_api_key, log_records});
  }

  // tslint:disable-next-line:variable-name
  getChannelUsage(channel_access_code: string, channel_access_api_key: string, start: string, stop: string): any {
    return this.http.post(this.config.apiUrl + '/channel/usage',
      {channel_access_code, channel_access_api_key, start, stop});
  }

  // tslint:disable-next-line:variable-name
  getChannelLandmarks(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.config.apiUrl + '/channel/landmarks',
      {channel_access_code, channel_access_api_key});
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
  getRestaurants(channel_access_code: string, channel_access_api_key: string, params: string,
                 lat: number, lng: number): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants',
      {channel_access_code, channel_access_api_key, params, lat, lng, testing: this.config.testMode});
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
