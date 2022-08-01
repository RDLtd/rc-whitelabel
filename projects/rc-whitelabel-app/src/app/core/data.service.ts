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
  private sites: any[] = [];

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    private http: HttpClient,
    private config: AppConfig,
    private router: Router
  ) {
    this.recentlyViewed = this.local.get('rdRecentlyViewed');
  }

  loadChannelConfig(domain: string): Promise<any> {
    return new Promise(async resolve => {
      await this.api.getChannelByDomain(domain)
        .toPromise()
        .then((res: any) => {
          resolve(res);
        });
    });
  }

  // Translations
  loadTranslations(code: string, key: string, lang: string): Promise<any> {
    return new Promise( async resolve => {
      await this.api.getChannelLanguage(code, key, lang)
        .toPromise()
        .then((res: any) => {
          resolve(res.language[0]);
        })
        .catch((error: any) => console.log('Unable to read Language information!', error)
        );
    });
  }

  // Get restaurants
  loadRestaurantsByParams(options: any): Promise<any> {

    const params = {
      filter: options.filter,
      filterText: options.filterText,
      offset: options.offset || 0,
      limit: options.limit,
      lat: options.lat,
      lng: options.lng,
      testing: this.config.testMode
    };

    // console.log('Params', params);

    return new Promise(async resolve => {
      await this.api.getRestaurantsByParams(this.config.channel.accessCode, this.config.channel.apiKey, params)
        .toPromise()
        .then((res: any) => {
          // console.log(res);
          if (!!res) {
            resolve(res.restaurants);
          } else {
            resolve([]);
          }
        })
        .catch((error: any) => {
          console.log('ERROR', error);
          this.router.navigate(['/error']);
        });
    });
  }

  // Get restaurants
  loadRestaurantsBySite(id: number): Promise<any> {

    // const params = {
    //   filter: options.filter,
    //   filterText: options.filterText,
    //   offset: options.offset || 0,
    //   limit: options.limit,
    //   lat: options.lat,
    //   lng: options.lng,
    //   testing: this.config.testMode
    // };

    // console.log('Params', params);

    return new Promise(async resolve => {
      await this.api.getChannelRestaurants(id, this.config.channel.accessCode, this.config.channel.apiKey)
        .toPromise()
        .then((data: any) => {
          console.log(data);
          if (!!data) {
            resolve(data.restaurants);
          } else {
            resolve([]);
          }
        })
        .catch((error: any) => {
          console.log('ERROR', error);
          this.router.navigate(['/error']);
        });
    });
  }

  loadChannelSettings(id: number): Promise <any> {
    return new Promise(async resolve => {
      await this.api.getChannelSettings(id)
        .toPromise()
        .then((data: any) => {
          console.log('Channel settings loaded', data);
          this.sites = data.camc;
          resolve(data);
        })
        .catch((error: any) => console.log('ERROR', error));
    });
  }

  loadChannelSites(): Promise <any> {
    return new Promise(async resolve => {
      if (this.sites.length) {
        console.log('Sites loaded from CACHE');
        resolve({
          sites: this.sites
        });
      } else {
        await this.api.getChannelSites(this.config.channel.id,  this.config.channel.accessCode, this.config.channel.apiKey)
          .toPromise()
          .then((res: any) => {
            console.log('Sites loaded from API');
            this.sites = res.sites;
            resolve({
              sites: this.sites
            });
          })
          .catch((error: any) => console.log('ERROR', error));
      }
    });
  }

  // Summary
  loadSummarisedData(): Promise <any> {
    return new Promise(async resolve => {
      if (this.cuisines.length) {
        console.log('Summary loaded from CACHE', this);
        resolve({
          restaurants: this.searchRests,
          landmarks: this.landmarks,
          features: this.features,
          cuisines: this.cuisines
        });
      } else {
        await this.api.getRestaurantsSummary(this.config.channel.accessCode, this.config.channel.apiKey,
          this.config.channel.latitude, this.config.channel.longitude)
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
  setCuisines(arr: any): void {
    this.cuisines = [];
    let i = arr.length;
    let c;
    while (i--) {
      c = arr[i];
      // @ts-ignore
      this.cuisines.push({
        label: c.Cuisine,
        total: c.Count
      });
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
