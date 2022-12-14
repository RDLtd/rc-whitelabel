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
    limit: 100,
    offset: 0,
    testing: false
  };
  apiUrl: string;

  constructor(
    private http: HttpClient,
    private config: AppConfig) {
    this.apiUrl = this.config.apiUrl;
  }

  getChannelByDomain(channel_domain: string): any {
    return this.http.post(this.apiUrl + '/channel/domain',
      {
        channel_domain
      });
  }

  getChannelLanguage(): any {
    return this.http.post(this.apiUrl + '/channel/language',
      {
        channel_access_code: this.config.channel.accessCode,
        channel_access_api_key: this.config.channel.apiKey,
        language: this.config.channel.language
      });
  }

  getChannelSettings(): any {
    return this.http.post(this.apiUrl + '/channels/getchannel',
      {
        channel_id: this.config.channel.id
      });
  }

  getRestaurantsNear(lat: number, lng: number, distance: number): any {
    return this.http.post(this.apiUrl + '/channel/restaurants/near',
      {
        channel_access_code: this.config.channel.accessCode,
        channel_access_api_key: this.config.channel.apiKey,
        lat,
        lng,
        distance, testing: this.config.testMode
      });
  }

  getRestaurantsByParamsFast(params: any): any {
    return this.http.post(this.apiUrl + '/channel/restaurants/parametersfast',
      {
        channel_access_code: this.config.channel.accessCode,
        channel_access_api_key: this.config.channel.apiKey,
        params
      });
  }

  getRestaurantsSummary(lat: number, lng: number, boundary: number): any {
    // console.log(channel_access_code: this.accessCode, channel_access_api_key: this.apiKey, lat, lng, boundary);
    return this.http.post(this.apiUrl + '/channel/restaurants/summary',
      {
        channel_access_code: this.config.channel.accessCode,
        channel_access_api_key: this.config.channel.apiKey,
        lat,
        lng,
        boundary,
        testing: this.config.testMode
      });
  }

  getFeaturedRestaurants(): any {
    return this.http.post(this.apiUrl + '/channel/restaurants/featured',
      {
        channel_access_code: this.config.channel.accessCode,
        channel_access_api_key: this.config.channel.apiKey
      });
  }
}
