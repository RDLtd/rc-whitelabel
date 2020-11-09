import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

export interface Restaurant {
  name: string | undefined;
  number: string | undefined;
  cuisine1: string | undefined;
  lat: number | undefined;
  lng: number | undefined;
  spwUrl: string | undefined;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {

  // Caches
  private restaurants: any[] = [];
  private searchRests: any[] = [];
  recentlyViewed: any = [];
  private cuisines: any[] = [];
  private landmarks: any[] = [];
  private features: any[] = [];

  // User
  private userLocation: any;


  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    private http: HttpClient,
    private config: AppConfig
  ) {
    console.log(this.recentlyViewed);
    this.recentlyViewed = this.local.get('rdRecentlyViewed');
  }

  // Get user location
  async getGeoLocation(): Promise<any> {
    return new Promise(resolve => {
      // Testing
      if (this.config.testing) {
        const geo = {
          timestamp: new Date().getTime(),
          coords: {
            latitude: this.config.channelLat,
            longitude: this.config.channelLng
          }
        };
        console.log('Geo test', geo);
        resolve(geo);
      } else
      // check cache
      if (!!this.userLocation) {
        console.log('Geo local');
        resolve(this.userLocation);
      } else {
        // Fetch from browser
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            console.log('Geo remote', position);
            this.userLocation = position;
            resolve(this.userLocation);
          });
        } else {
          console.log('Geolocation is not supported by this browser, setting channel default location');
        }
      }
    });
  }
  async getUserLocation(): Promise<any> {
    return await this.getGeoLocation();
  }
  // Restaurants
  async loadRestaurants(): Promise <any> {
    if (this.restaurants.length) {
      console.log('Async local');
      return this.restaurants;
    } else {
      console.log('Async remote');
      return await this.api.getRestaurantsFilter(this.config.channelAccessCode, this.config.channelAPIKey,
        {testing: this.config.testing}).toPromise();
    }
  }
  getRestaurants(): any[] {
    return this.restaurants;
  }
  setRestaurants(arr: any[]): void {
    this.restaurants = arr;
  }
  // Summary data
  setSummary(s: any): void {
    this.setCuisines(s.cuisines);
    this.landmarks = s.landmarks;
    this.features = s.features;
    this.searchRests = s.restaurants;
  }
  getCuisines(): any[] {
    return this.cuisines;
  }
  getLandmarks(): any[] {
    return this.landmarks;
  }
  getFeatures(): any[] {
    return this.features;
  }
  getSearchRests(): any[] {
    return this.searchRests;
  }
  setCuisines(arr: any): void {
    let i = arr.length;
    let c;
    while (i--) {
      c = arr[i];
      if (c.Count) {
        // @ts-ignore
        this.cuisines.push({
          label: c.Cuisine,
          total: c.Count
        });
      }
    }
    this.cuisines.sort((a, b) => {
      return b.total - a.total;
    });
    console.log(this.cuisines);
  }
  // recently viewed
  getRecentlyViewed(): any[] {
    return this.recentlyViewed;
  }
  setRecentlyViewed(restaurant: any): void {
    // Check whether value is the array
    // TODO: use restaurant_number when in production
    const maxNum = 5;
    if (this.recentlyViewed) {
      const idx = this.recentlyViewed.map((item: any) => item.restaurant_name).indexOf(restaurant.restaurant_name);
      // remove object
      if (idx > -1) {
        this.recentlyViewed.splice(idx, 1);
      }
      // add to beginning
      this.recentlyViewed.unshift(restaurant);
      this.recentlyViewed.splice(maxNum);
    } else {
      this.recentlyViewed = [restaurant];
    }
    // Sore locally
    this.local.set('rdRecentlyViewed', this.recentlyViewed);
    // console.log(this.recentlyViewed);
  }
}
