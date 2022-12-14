import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  // Caches
  recentlyViewed: any = [];
  summarisedResults: any;
  summaryCache: any[] = [];

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    private http: HttpClient,
    private config: AppConfig
  ) {
    this.recentlyViewed = this.local.get('rdRecentlyViewed');
  }

  // Channel config.
  loadChannelConfig(domain: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.api.getChannelByDomain(domain)
        .toPromise()
        .then((res: any) => {
          if(!res) {
            reject('Failed to load channel config!!');
          }
          resolve(res);
        })
        .catch((error: any) => console.log(error));
    });
  }

  // Translations
  loadTranslations(): Promise<any> {
    console.log('loadTranslations');
    return new Promise( async (resolve, reject) => {
      await this.api.getChannelLanguage()
        .toPromise()
        .then((res: any) => {
          if(!res) {
            reject('Unable to load language!!');
          }
          resolve(res.language[0]);
        })
        .catch((error: any) => console.log(error));
    });
  }

  /**
   * Get channel configuration
   */
  loadChannelSettings(): Promise <any> {
    return new Promise(async (resolve, reject) => {
      await this.api.getChannelSettings()
        .toPromise()
        .then((data: any) => {
          if(!data){ reject('Failed to load channel settings!!')}
          console.log('Channel settings loaded', data);
          resolve(data);
        })
        .catch((error: any) => console.log(error));
    });
  }

  /**
   * Get summarised results of search query
   * @param lat
   * @param lng
   * @param boundary
   */
  loadResultsSummary(
    lat = +this.config.channel.latitude.toFixed(6),
    lng = +this.config.channel.longitude.toFixed(6),
    boundary = this.config.channel.boundary): Promise <any> {

    // Do we have a cache?
    if (this.summaryCache.length > 0) {
      // Have we got a summary for this latLng
      // in our cache?
      let cachedData =
        this.summaryCache.find(element => element.latLng === `${lat},${lng}`);
      if(cachedData) {
        this.summarisedResults = cachedData.data;
        return new Promise<any>( resolve => {
          console.log('CACHED', this.summaryCache);
          resolve(this.summarisedResults);
        });
      }
    }
    return new Promise(async (resolve, reject) => {
      await this.api.getRestaurantsSummary(lat, lng, boundary)
        .toPromise()
        .then((data: any) => {
          if(!data) { reject('Failed to load restaurant summary!!')}
          this.summarisedResults = data;
          // Store in our cache
          this.summaryCache.push({
            latLng: `${lat},${lng}`,
            data: this.summarisedResults
          });
          resolve(this.summarisedResults);
        })
        .catch((error: any) => console.log(error));
    });

  }

  loadRestaurantResults(params: any): Promise<any> {
    // console.log('loadRestaurantResults', params);
    return new Promise(async (resolve, reject) => {
      await this.api.getRestaurantsByParamsFast(params)
        .toPromise()
        .then((data: any) => {
          if(!data) {
            reject('No restaurant results!!');
          }
          resolve(data);
        })
        .catch((error: any) => console.log(error));
    });
  }

  loadFeaturedRestaurants(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.api.getFeaturedRestaurants()
        .toPromise()
        .then((data: any) => {
          if(!data) {
            reject('No featured restaurants defined!!!');
          }
          resolve(data);
        })
        .catch((error: any) => console.log(error))
    });
  }

// recently viewed
  setRecentlyViewed(restaurant: any): void {
    console.log('Recent', restaurant);

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
    console.log(this.recentlyViewed);
  }
}
