import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class ApiService {

  constructor(private http: HttpClient) { }

  // will need to get this from the ENV
  apiUrl = 'http://localhost:4000';
  // apiUrl = 'https://rc-server-prod.herokuapp.com';

  // Administration
  // tslint:disable-next-line:variable-name
  getChannelInfo(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.apiUrl + '/public/channel/info',
      { channel_access_code, channel_access_api_key });
  }

  // tslint:disable-next-line:variable-name
  getChannelData(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.apiUrl + '/public/channel/data',
      { channel_access_code, channel_access_api_key });
  }

  // tslint:disable-next-line:variable-name
  getChannelLogs(channel_access_code: string, channel_access_api_key: string, log_records: string): any {
    return this.http.post(this.apiUrl + '/public/channel/logs',
      { channel_access_code, channel_access_api_key, log_records });
  }

  // tslint:disable-next-line:variable-name
  getChannelUsage(channel_access_code: string, channel_access_api_key: string, start: string, stop: string): any {
    return this.http.post(this.apiUrl + '/public/channel/usage',
      { channel_access_code, channel_access_api_key, start, stop });
  }

  // tslint:disable-next-line:variable-name
  getChannelLandmarks(channel_access_code: string, channel_access_api_key: string): any {
    return this.http.post(this.apiUrl + '/public/channel/landmarks',
      { channel_access_code, channel_access_api_key });
  }

  // Restaurant Detail
  // tslint:disable-next-line:variable-name
  getRestaurant(channel_access_code: string, channel_access_api_key: string, restaurant_number: string,
                lat: number, lng: number): any {
    return this.http.post(this.apiUrl + '/public/channel/restaurant',
      { channel_access_code, channel_access_api_key, restaurant_number, lat, lng });
  }

  // Restaurants
  // tslint:disable-next-line:variable-name
  getRestaurants(channel_access_code: string, channel_access_api_key: string, params: string,
                 lat: number, lng: number): any {
    return this.http.post(this.apiUrl + '/public/channel/restaurants',
      { channel_access_code, channel_access_api_key, params, lat, lng});
  }

  // tslint:disable-next-line:variable-name
  getRestaurantsSummary(channel_access_code: string, channel_access_api_key: string,
                        lat: number, lng: number): any {
    return this.http.post(this.apiUrl + '/public/channel/restaurants/summary',
      { channel_access_code, channel_access_api_key, lat, lng});
  }

}

