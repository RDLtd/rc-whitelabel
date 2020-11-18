import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Router } from '@angular/router';

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
    private config: AppConfig,
    private router: Router
  ) {
    this.recentlyViewed = this.local.get('rdRecentlyViewed');
  }

  // Get user location
  async getGeoLocation(): Promise<any> {
    return new Promise(resolve => {
      // Testing
      // if (this.config.testMode) {
      //   const geo = {
      //     timestamp: new Date().getTime(),
      //     coords: {
      //       latitude: this.config.channelLat,
      //       longitude: this.config.channelLng
      //     }
      //   };
      //   console.log('Geo test', geo);
      //   resolve(geo);
      // } else
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
  loadRestaurants(): Promise <any> {
    return new Promise(async resolve => {
      if (this.restaurants.length) {
        console.log(`${this.restaurants.length} restaurants loaded from CACHE`);
        resolve(this.restaurants);
      } else {
        await this.api.getRestaurantsFilter(this.config.channelAccessCode, this.config.channelAPIKey,
          {testing: this.config.testMode})
          .toPromise()
          .then((res: any) => {
            this.restaurants = res.restaurants;
            console.log(`${this.restaurants.length} restaurants loaded from API`);
            resolve(this.restaurants);
          })
          .catch((error: any) => {
            console.log('ERROR', error);
            this.router.navigate(['/error']);
          });
      }
    });
  }

  // Summary
  loadSummarisedData(): Promise <any> {
    return new Promise(async resolve => {
      if (this.cuisines.length) {
        console.log('Summary loaded from CACHE');
        resolve({
          restaurants: this.searchRests,
          landmarks: this.landmarks,
          features: this.features,
          cuisines: this.cuisines
        });
      } else {
        await this.api.getRestaurantsSummary(this.config.channelAccessCode, this.config.channelAPIKey,
          this.config.channelLat, this.config.channelLng)
          .toPromise()
          .then((res: any) => {
            console.log('Summary loaded from API');
            this.setSummary(res);
            resolve({
              restaurants: this.searchRests,
              landmarks: this.landmarks,
              features: this.features,
              cuisines: this.cuisines
            });
          })
          .catch((error: any) => console.log('ERROR', error));
      }
    });
  }
  // Summary data
  setSummary(s: any): void {
    this.setCuisines(s.cuisines);
    this.landmarks = s.landmarks;
    this.features = s.attributes;
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
    // Check whether this restaurant is already in the array
    const maxNum = 5;
    if (this.recentlyViewed) {
      const idx = this.recentlyViewed.map((item: any) => item.restaurant_number)
        .indexOf(restaurant.restaurant_number);
      // If it is then remove it
      if (idx > -1) {
        this.recentlyViewed.splice(idx, 1);
      }
      // and add to beginning
      this.recentlyViewed.unshift(restaurant);
      this.recentlyViewed.splice(maxNum);
    } else {
      this.recentlyViewed = [restaurant];
    }
    // Update localStorage
    this.local.set('rdRecentlyViewed', this.recentlyViewed);
    // console.log(this.recentlyViewed);
  }

  setChannelInfo(): void {
    // Load config
    // Would like to move this to data service
    this.api.getChannelInfo(this.config.channelAccessCode, this.config.channelAPIKey)
      .toPromise()
      .then((data: any) => {
        this.config.setChannel(data.channel_info);
        this.api.getChannelLanguage(this.config.channelAccessCode, this.config.channelAPIKey, this.config.language)
          .toPromise()
          .then((language: any) => {
            this.config.setLanguage( language.language[0]);
          })
          .catch((error: any) => console.log('Unable to read Language information!', error)
          );
      })
      .catch((error: any) => console.log('Unable to read Channel information!', error)
      );
  }
}
