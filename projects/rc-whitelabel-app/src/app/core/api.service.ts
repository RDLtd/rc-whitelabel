import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(
    private http: HttpClient,
    private config: AppConfig) { }

  // tslint:disable-next-line:variable-name
  getChannelByDomain(channel_domain: string): any {
    return this.http.post(this.config.apiUrl + '/channel/domain',
      {channel_domain});
  }

  // tslint:disable-next-line:variable-name
  getChannelLanguage(channel_access_code: string, channel_access_api_key: string, language: string): any {
    return this.http.post(this.config.apiUrl + '/channel/language',
      {
        channel_access_code,
        channel_access_api_key,
        language
      });
  }
  // tslint:disable-next-line:variable-name
  getRestaurantsNear(channel_access_code: string, channel_access_api_key: string,
                     lat: number, lng: number, distance: number): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants/near',
      {
        channel_access_code,
        channel_access_api_key,
        lat,
        lng,
        distance, testing: this.config.testMode
      });
  }



  // Restaurants
  // tslint:disable-next-line:variable-name
  getRestaurantsByParams(channel_access_code: string, channel_access_api_key: string, params: any): any {
    console.log(channel_access_code, channel_access_api_key, params);
    return this.http.post(this.config.apiUrl + '/channel/restaurants/parameters',
      {
        channel_access_code,
        channel_access_api_key,
        params
      });
  }

  // tslint:disable-next-line:variable-name
  getRestaurantsSummary(channel_access_code: string, channel_access_api_key: string,
                        lat: number, lng: number): any {
    return this.http.post(this.config.apiUrl + '/channel/restaurants/summary',
      {
        channel_access_code,
        channel_access_api_key,
        lat,
        lng,
        testing: this.config.testMode
      });
  }

}
