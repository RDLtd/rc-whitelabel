import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';

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

  // Config
  private apiAccessCode = 'FR0100';
  private apiKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';

  // Restaurants
  private restaurants: any[] = [];
  private searchRests: any[] = [];
  private summary: any = {};
  private cuisines: any[] = [];
  private landmarks: any[] = [];
  private features: any[] = [];

  constructor(
    private api: ApiService,
    private local: LocalStorageService
  ) { }

  getRestaurants(): any[] {
    return this.restaurants;
  }

  setRestaurants(arr: any[]): void {
    this.restaurants = arr;
  }

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
    let i = arr.length - 1;
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
  }
}
