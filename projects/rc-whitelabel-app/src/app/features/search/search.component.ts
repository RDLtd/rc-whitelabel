import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { LocalStorageService } from '../../core/local-storage.service';
import { DataService } from '../../core/data.service';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';
import { LocationService } from '../../core/location.service';
import { fadeIn, fadeInSlideUp } from '../../shared/animations';

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
  templateUrl: './search.component.html',
  animations: [fadeIn, fadeInSlideUp]
})

export class SearchComponent implements OnInit {
  isLoaded = false;

  // Reference to search element
  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  // Config
  minSearchChars = 1;
  noSuggestions = false;
  icons = {
    location: 'location_on',
    cuisine: 'restaurant',
    restaurant: 'store',
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
  // User location
  currentLocation: any | undefined;
  currentDistance: any | undefined;
  inRange = false;

  constructor(
    private api: ApiService,
    private storageService: LocalStorageService,
    private data: DataService,
    public config: AppConfig,
    public router: Router,
    private location: LocationService
  ) { }

  ngOnInit(): void {

    this.location.getUserGeoLocation().subscribe(pos => {
      this.currentLocation = pos;
      if (!!this.storageService.getSession('userDistance')) {
        this.inRange = this.storageService.getSession('userDistance') < this.config.maxDistance;
      } else {
        this.data.getDistanceToNearestRestaurant(pos.coords.latitude, pos.coords.longitude)
          .then(d => {
            this.storageService.setSession('userDistance', d);
            this.inRange = this.currentDistance < this.config.maxDistance;
          });
      }
    });

    // Restaurants
    this.data.loadRestaurants().then((res: any) => {
      // console.log(res);
    });

    // Summarised data
    this.data.loadSummarisedData().then((data: any) => {
      this.searchRestaurants = data.restaurants;
      this.landmarks = data.landmarks;
      this.features = data.attributes;
      this.cuisines = data.cuisines;
      this.isLoaded = true;
    });

    // So that we can focus the input field
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 0);

    // Grab recents from local storage
    this.recentlyViewed = this.storageService.get('rdRecentlyViewed');
  }

  public async loadSummary(): Promise<any> {
    if (!this.data.getCuisines().length) {
      const promise = await this.api.getRestaurantsSummary(this.config.channelAccessCode, this.config.channelAPIKey,
        this.config.channelLat, this.config.channelLng)
        .toPromise()
        .then((res: any) => {
          console.log('S', res);
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
    this.recentlyViewed = this.storageService.get('rdRecentlyViewed');
  }

  doSearch(str: string): void {

    // Scroll window to maximise room for search suggestions
    // window.scrollTo(0, 64);

    this.noSuggestions = false;
    // const maxSuggestions = 10;

    if (str.length >= this.minSearchChars) {
      // Normalize any extended latin (if supported by browser)
      // and force uppercase for matching
      if (str.normalize !== undefined) {
        str = str.normalize ('NFKD').replace (/[\u0300-\u036F]/g, '').toUpperCase();
      } else {
        str = str.toUpperCase();
      }
      // Create regex that looks for beginning of word matches
      const regex =  new RegExp(`\\b${str}\\S*`, 'g');
      // Clear current suggestions
      this.searchSuggestions = [];
      // Check for matching landmarks
      if (!!this.landmarks) {
        let i = this.landmarks.length; let m; let idx;
        while (i--) {
          m = this.landmarks[i];
          idx = m.channel_landmark_name.toUpperCase().search(regex);
          if (idx > -1) {
            // Add SearchSuggestion
            this.searchSuggestions.push({
              name: m.channel_landmark_name,
              cat: 'location',
              index: idx,
              route: ['/restaurants/nearest/', `${m.channel_landmark_lat}:${m.channel_landmark_lng}`]
            });
          }
        }
      }
      // Check for matching restaurants
      if (!!this.searchRestaurants) {
        let i = this.searchRestaurants.length; let r; let idx;
        while (i--) {
          r = this.searchRestaurants[i];
          idx = r.restaurant_name.toUpperCase().search(regex);
          if (idx > -1) {
            this.searchSuggestions.push({
              cat: 'restaurant',
              name: r.restaurant_name,
              index: idx,
              spw: r.restaurant_spw_url
            });
          }
        }
      }
      // Check for matching cuisines
      if (!!this.cuisines) {
        let i = this.cuisines.length; let c; let idx;
        while (i--) {
          c = this.cuisines[i];
          idx = c.label.toUpperCase().search(regex);
          if (idx > -1) {
            this.searchSuggestions.push({
              cat: 'cuisine',
              name: c.label,
              index: idx,
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
      // this.searchSuggestions.splice(maxSuggestions);
      this.noSuggestions = this.searchSuggestions.length === 0;
    } else {
      // clear current suggestions
      this.searchSuggestions = [];
    }
  }

  searchReset(): void {
    this.rdSearchInput.nativeElement.value = '';
    this.searchSuggestions = [];
    this.noSuggestions = false;
    this.rdSearchInput.nativeElement.focus();
  }

  viewRestaurantSpw(restaurant: any): void {
    console.log(restaurant);
    this.data.setRecentlyViewed({
      restaurant_name: restaurant.name,
      restaurant_spw_url: restaurant.spw || restaurant.restaurant_spw_url,
      restaurant_number: restaurant.number
    });
    this.searchReset();
    window.open(restaurant.spw, '_blank');
  }
}
