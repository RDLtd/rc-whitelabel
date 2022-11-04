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
  private sites: any[] = [];

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
    console.log('loadTranslations');
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
  /**
   * Get channel configuration
   * @param id - channel id
   */
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

  /**
   * Get all sites associated with channel
   * like CAMC
   */
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
            if (res === null) {
              console.log('This Channel does not have sites configured');
              return;
            }
            console.log('Sites loaded from API', res);
            this.sites = res.sites;
            resolve({
              sites: this.sites
            });
          })
          .catch((error: any) => console.log('ERROR', error));
      }
    });
  }


  /**
   * Get summarised results of search query
   * @param lat
   * @param lng
   * @param boundary
   */
  loadResultsSummary(
    lat = this.config.channel.latitude,
    lng = this.config.channel.longitude,
    boundary = this.config.channel.boundary): Promise <any> {
    return new Promise(async resolve => {
      await this.api.getRestaurantsSummary(
        this.config.channel.accessCode,
        this.config.channel.apiKey,
        lat,
        lng,
        boundary
      )
        .toPromise()
        .then((data: any) => {
          resolve(data);
        })
        .catch((error: any) => console.log('ERROR', error));
    });
  }

  loadRestaurantResults(code: string, key: string, params: any): Promise<any> {
    console.log('loadRestaurantResults', params);
    return new Promise(async resolve => {
      await this.api.getRestaurantsByParamsFast(code, key, params)
        .toPromise()
        .then((data: any) => {
          resolve(data);
        })
        .catch((error: any) => console.log('ERROR', error));
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
