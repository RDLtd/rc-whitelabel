import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api.service';
import { LocalStorageService } from '../../local-storage.service';
import { DataService } from '../../data.service';
import { AppConfig } from '../../app.config';

interface SearchSuggestion {
  cat: string;
  name: string;
  index: number;
  route?: string[];
  spw?: string;
  misc?: any;
}
interface Landmark {
  channel_landmark_channel_id: string;
  channel_landmark_id: number;
  channel_landmark_lat: string;
  channel_landmark_lng: string;
  channel_landmark_name: string;
  channel_landmark_number: number;
}
interface Cuisine {
  label: string;
  total: number;
}

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})

export class SearchComponent implements OnInit {
  isLoaded = false;
  // Reference to search element
  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;


  // Config
  minChars = 1;
  icons = {
    location: 'location_on',
    cuisine: 'restaurant',
    restaurant: 'food_bank',
    nearest: 'my_location',
    takeaway: 'fast_food',
    recent: 'watch_later'
  };

  restaurants: any[] = [];
  searchRestaurants: any[] = [];
  landmarks: Landmark[] = [];
  features: any[] = [];
  searchSuggestions: SearchSuggestion[] = [];
  cuisines: Cuisine[] = [];
  recentlyViewed: any[] = [];
  // This will be a GeoPositionLocation
  currentLocation: any | undefined;

  constructor(
    private api: ApiService,
    private localStorageService: LocalStorageService,
    private data: DataService,
    public config: AppConfig
  ) { }

  ngOnInit(): void {
    // Geolocation
    this.data.getUserLocation()
      .then((geo: any) => {
        this.currentLocation = geo;
    });
    this.loadRestaurants().then(() => {
      console.log('Restaurants loaded');
    });
    this.loadSummary().then(() => {
      this.isLoaded = true;
      console.log('Summary loaded');
    });
    // So that we can focus the input field
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 500);
    // Grab recents from local storage
    this.recentlyViewed = this.localStorageService.get('rdRecentlyViewed');
  }

  public async loadRestaurants(): Promise<any> {
    if (!this.data.getRestaurants().length) {
      const params = { testing: this.config.testing };
      const promise = await this.api.getRestaurantsFilter(this.config.channelAccessCode, this.config.channelAPIKey, params)
        .toPromise()
        .then((res: any) => {
          this.restaurants = res.restaurants;
          this.data.setRestaurants(res.restaurants);
          console.log('From API', res.restaurants);
        });
    } else {
      this.restaurants = this.data.getRestaurants();
      console.log('Local', this.restaurants);
    }
  }

  public async loadSummary(): Promise<any> {
    if (!this.data.getCuisines().length) {
      const promise = await this.api.getRestaurantsSummary(this.config.channelAccessCode, this.config.channelAPIKey,
        this.config.channelLat, this.config.channelLng)
        .toPromise()
        .then((res: any) => {
          console.log(res);
          this.data.setSummary(res);
          this.searchRestaurants = res.restaurants;
          this.landmarks = res.landmarks;
          this.features = res.attributes;
          this.cuisines = this.data.getCuisines();
        });
    } else {
      this.searchRestaurants = this.data.getSearchRests();
      this.cuisines = this.data.getCuisines();
      this.landmarks = this.data.getLandmarks();
      this.features = this.data.getFeatures();
    }
  }

  getRecentlyViewed(): void {
    this.recentlyViewed = this.localStorageService.get('rdRecentlyViewed');
  }

  doSearch(str: string): void {

    // Scroll window to maximise room for search suggestions
    window.scrollTo(0, 64);

    if (str.length >= this.minChars) {
      // set uppercase version for string matching
      const ucString = str.toUpperCase();
      // Clear current suggestions
      this.searchSuggestions = [];
      // Check for matching landmarks
      if (!!this.landmarks) {
        let i = this.landmarks.length - 1; let m;
        while (i--) {
          m = this.landmarks[i];
          if (m.channel_landmark_name.toUpperCase().includes(ucString)) {
            // Add SearchSuggestion
            this.searchSuggestions.push({
              name: m.channel_landmark_name,
              cat: 'location',
              index: m.channel_landmark_name.toUpperCase().indexOf(ucString),
              route: ['/restaurants/nearest/', `${m.channel_landmark_lat}:${m.channel_landmark_lng}`]
            });
          }
        }
      }
      // Check for matching restaurants
      if (!!this.searchRestaurants) {
        let i = this.searchRestaurants.length - 1; let r;
        while (i--) {
          r = this.searchRestaurants[i];
          if (r.restaurant_name?.toUpperCase().includes(ucString)) {
            this.searchSuggestions.push({
              cat: 'restaurant',
              name: r.restaurant_name,
              index: r.restaurant_name.toUpperCase().indexOf(ucString),
              spw: r.restaurant_spw_url
            });
          }
        }
      }
      // Check for matching restaurants
      if (!!this.cuisines) {
        let i = this.cuisines.length - 1; let c;
        while (i--) {
          c = this.cuisines[i];
          if (c.label.toUpperCase().includes(ucString)) {
            this.searchSuggestions.push({
              cat: 'cuisine',
              name: c.label,
              index: c.label.toUpperCase().indexOf(ucString),
              route: ['/restaurants', `${c.label}`],
              misc: c.total
            });
          }
        }
      }
      // Sort results by index position
      this.searchSuggestions.sort((a, b) => {
        return a.index - b.index;
      });
    } else {
      // clear current suggestions
      this.searchSuggestions = [];
    }
  }

  searchReset(): void {
    this.rdSearchInput.nativeElement.value = '';
    this.searchSuggestions = [];
  }



}
