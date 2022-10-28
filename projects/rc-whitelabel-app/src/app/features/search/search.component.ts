import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { LocalStorageService } from '../../core/local-storage.service';
import { DataService } from '../../core/data.service';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';
import { LocationService } from '../../core/location.service';
import { fadeIn, fadeInSlideUp } from '../../shared/animations';
import { Title } from '@angular/platform-browser';
import {AnalyticsService} from '../../core/analytics.service';

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
interface Site {
  name: string;
  id: number;
  lat: string;
  lng: string;
  notes: string;
}
interface Cuisine {
  Cuisine: string;
  Count: number;
}

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html',
  animations: [fadeIn, fadeInSlideUp]
})

export class SearchComponent implements OnInit {
  isLoaded = false;
  maxCuisines = 5;
  isChannelSite = false;

  // Reference to search element
  // so that we can set focus
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

  // Results
  restaurants: any[] = [];
  searchRestaurants: any[] = [];
  landmarks: Landmark[] = [];
  features: any[] = [];
  searchSuggestions: SearchSuggestion[] = [];
  cuisines: Cuisine[] = [];
  recentlyViewed: any[] = [];

  // User location
  userPosition: any | undefined;

  // Channel search config
  channelConfig = {
    channelType: 3,
    defaultView: 'list',
    showRecentlyViewed: true,
    showLandmarks: true,
    showCuisines: true,
    searchPlaceholderTxt: 'Type landmark, restaurant or cuisine',
    noResultsTxt: 'No matches'
  }

  siteConfig = {
    channelType: 3,
    defaultView: 'map',
    showRecentlyViewed: true,
    showLandmarks: false,
    showCuisines: false,
    searchPlaceholderTxt: 'Enter a site name or restaurant name',
    noResultsTxt: 'No matches'
  }

  channelSites: Site[] = [];

  constructor(
    private api: ApiService,
    private storageService: LocalStorageService,
    private data: DataService,
    public config: AppConfig,
    public router: Router,
    private location: LocationService,
    private title: Title,
    private ga: AnalyticsService
  ) {

    // Is this a type Site implementation?
    // if (this.config.channel?.type === 'sites') {
    //   console.log('Loading site config');
    //   this.isChannelSite = true;
    //   this.channelConfig = this.siteConfig;
    //   this.data.loadChannelSites().then((data: any) => {
    //     const sites = data.sites;
    //     console.log(sites);
    //     sites.forEach((item: any) => {
    //       this.channelSites.push({
    //         id: item.id,
    //         lat: item.lat,
    //         lng: item.lng,
    //         name: item.name,
    //         notes: item.notes
    //       });
    //     });
    //     // sort the list
    //     //this.channelSites.sort((a, b) => (a.name < b.name) ? -1 : 1 );
    //     // console.log(this.channelSites);
    //   });
    // }
    console.log('Loading default config');
    title.setTitle('Search');

  }

  ngOnInit(): void {

    // Observe user's position
    this.location.userLocationObs.subscribe((userPos) => {
      console.log(userPos);
      this.userPosition = userPos;
    });

    // Summarised data
    this.data.loadResultsSummary().then((data: any) => {
      console.log('LoadSummary', data);
      this.searchRestaurants = data.restaurants;
      this.landmarks = data.landmarks;
      this.features = data.attributes;
      this.cuisines = data.cuisines;
      this.isLoaded = true;
    });

    // Focus the search input
    // Need to use a timeout to force a different thread
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 0);

    // Get recent restaurants
    this.recentlyViewed = this.storageService.get('rdRecentlyViewed');

      this.data.loadChannelSites().then((data: any) => {
        const sites = data.sites;
        console.log('SITES', sites);
        sites.forEach((item: any) => {
          this.channelSites.push({
            id: item.id,
            lat: item.lat,
            lng: item.lng,
            name: item.name,
            notes: item.notes
          });
        });
      });

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
              route: ['/restaurants', 'map', `${m.channel_landmark_lat},${m.channel_landmark_lng}`]
            });
            console.log('Route', `/restaurants/${this.channelConfig.defaultView}/${m.channel_landmark_lat},${m.channel_landmark_lng}`);

          }
        }
      }

      // Check for matching sites
      if (!!this.channelSites) {
        let i = this.channelSites.length; let s; let idx;
        while (i--) {
          s = this.channelSites[i];
          idx = s.name.toUpperCase().search(regex);
          if (idx > -1) {
            // Add SearchSuggestion
            this.searchSuggestions.push({
              name: s.name,
              cat: 'site',
              index: idx,
              route: ['/restaurants', 'map', `${s.lat},${s.lng}`]
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
      if (!!this.cuisines && this.channelConfig.showCuisines) {
        let i = this.cuisines.length; let c; let idx;
        while (i--) {
          c = this.cuisines[i];
          idx = c.Cuisine.toUpperCase().search(regex);
          if (idx > -1) {
            this.searchSuggestions.push({
              cat: 'cuisine',
              name: c.Cuisine,
              index: idx,
              route: ['restaurants', 'list', `${this.config.channel.latitude},${this.config.channel.longitude}`, `${c.Cuisine}`],
              misc: c.Cuisine
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

  getTopCuisines(): Array<Cuisine> {
    console.log(this.cuisines.slice(0, this.config.maxTopCuisines));
    return this.cuisines.slice(0, this.config.maxTopCuisines);
  }

  searchReset(): void {
    this.rdSearchInput.nativeElement.value = '';
    this.searchSuggestions = [];
    this.noSuggestions = false;
    this.rdSearchInput.nativeElement.focus();
  }

  viewRecentlyViewed(restaurant: any): void {
    console.log('recent', restaurant);
    this.viewRestaurantSpw(restaurant);
    this.searchReset()
  }

  viewRestaurantSpw(restaurant: any): void {
    console.log(restaurant);
    this.data.setRecentlyViewed(restaurant);
    this.data.setRecentlyViewed({
      restaurant_name: restaurant.name || restaurant.restaurant_name,
      restaurant_spw_url: restaurant.spw || restaurant.restaurant_spw_url,
      restaurant_number: restaurant.number || restaurant.restaurant_number
    });
    this.searchReset();
    //
    const restName = restaurant.name || restaurant.restaurant_name;
    this.ga.eventEmitter(
      'page_view_spw',
      'search_recently_viewed',
      'open_spw', `spw/${restName.replace(/\s/g , "-")}`,
      0);
    window.open(restaurant.spw || restaurant.restaurant_spw_url, '_blank');
  }
}
