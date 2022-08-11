import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  params = {
    filter: '',
    filterText: '',
    lat: '51.7521849865759',
    lng: '-1.2579775767154544',
    limit: 10,
    offset: 0,
    testing: false
  };

  constructor(
    private http: HttpClient,
    private config: AppConfig) { }

  // tslint:disable-next-line:variable-name
  getChannelByDomain(channel_domain: string): any {
    return this.http.post(this.config.apiUrl + '/channel/domain',
      {
        channel_domain
      });
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

  getChannelSettings(channel_id: number): any {
    return this.http.post(this.config.apiUrl + '/channels/getchannel',
      {
        channel_id
      });
  }

  getChannelSites(channel_id: number, channel_access_code: string, channel_access_api_key: string,): any {
    return this.http.post(this.config.apiUrl + '/channel/sites',
      {
        channel_id,
        channel_access_code,
        channel_access_api_key
      });
  }
  getChannelSite(site_id: number, channel_access_code: string, channel_access_api_key: string,): any {
    return this.http.post(this.config.apiUrl + '/channel/site',
      {
        site_id,
        channel_access_code,
        channel_access_api_key
      });
  }
  getChannelRestaurants(site_id: number, channel_access_code: string, channel_access_api_key: string,): any {
    return this.http.post(this.config.apiUrl + '/channel/siterestaurants',
      {
        site_id,
        channel_access_code,
        channel_access_api_key
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
    console.log('getRestaurantsByParams');
    return this.http.post(this.config.apiUrl + '/channel/restaurants/parameters',
      {
        channel_access_code,
        channel_access_api_key,
        params
      });
  }

  // tslint:disable-next-line:variable-name
  getRestaurantsSummary(channel_access_code: string, channel_access_api_key: string, lat: number, lng: number): any {
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
