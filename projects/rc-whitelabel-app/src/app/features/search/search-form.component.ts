import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { LocalStorageService } from '../../core/local-storage.service';
import { DataService } from '../../core/data.service';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';
import { LocationService } from '../../core/location.service';
import { fadeIn, fadeInSlideUp } from '../../shared/animations';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/analytics.service';
import { MatDialogRef } from '@angular/material/dialog';

interface SearchSuggestion {
  cat: string;
  name: string;
  index: number;
  spw?: string;
  latLng?: string;
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
  Cuisine: string;
  Count: number;
}

@Component({
  selector: 'rd-search-form',
  templateUrl: './search-form.component.html',
  animations: [fadeIn, fadeInSlideUp]
})

export class SearchFormComponent implements OnInit {
  isLoaded = false;

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

  constructor(
    private api: ApiService,
    private storageService: LocalStorageService,
    private data: DataService,
    public config: AppConfig,
    public router: Router,
    private location: LocationService,
    private title: Title,
    private ga: AnalyticsService,
    public dialog: MatDialogRef<any>
  ) {

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
      if ( data === null) {
        console.log(`No restaurants available within ${this.config.channel.boundary} of the Channel centre.`);
        this.isLoaded = true;
        return;
      }
      // console.log('LoadSummary', data);
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
    // this.recentlyViewed = this.storageService.get('rdRecentlyViewed');

  }

  getAutoSuggestions(str: string): void {

    // Scroll window to maximise room for search suggestions
    // window.scrollTo(0, 64);

    this.noSuggestions = false;
    // const maxSuggestions = 10;

    if (str.length >= this.minSearchChars) {

      // Normalize any extended latin characters
      // and force uppercase for matching
      // IF supported by current browser
      if (str.normalize !== undefined) {
        str = str.normalize ('NFKD').replace (/[\u0300-\u036F]/g, '').toUpperCase();
      } else {
        str = str.toUpperCase();
      }

      // Create a regex pattern that only
      // looks for beginning of word matches
      const regex =  new RegExp(`\\b${str}\\S*`, 'g');

      // Clear current suggestions
      this.searchSuggestions = [];

      // Landmarks/Points of interest
      if (!!this.landmarks) {
        let matchPosition;
        this.landmarks.forEach((item: any) => {
          // record the match position
          // lower number = higher relevancy
          matchPosition = item.channel_landmark_name.toUpperCase().search(regex)
          if (matchPosition >= 0) {
            this.searchSuggestions.push({
              name: item.channel_landmark_name,
              cat: 'location',
              index: matchPosition,
              latLng: `${item.channel_landmark_lat},${item.channel_landmark_lng}`
            });
          }
        });

        // Restaurants
        if (!!this.searchRestaurants) {
          let matchPosition;
          this.searchRestaurants.forEach((item: any) => {
            // record the match position
            // lower number = higher relevancy
            matchPosition = item.restaurant_name.toUpperCase().search(regex);
            if (matchPosition >= 0) {
              this.searchSuggestions.push({
                cat: 'restaurant',
                name: item.restaurant_name,
                index: matchPosition,
                spw: item.restaurant_spw_url
              });
            }
          });
        }

        // Check for matching cuisines
        if (!!this.cuisines && this.channelConfig.showCuisines) {
          let matchPosition;
          this.cuisines.forEach((item: any) => {
            // record the match position
            // lower number = higher relevancy
            matchPosition = item.Cuisine.toUpperCase().search(regex);
            if(matchPosition >= 0) {
              this.searchSuggestions.push({
                cat: 'cuisine',
                name: item.Cuisine,
                index: matchPosition,
                latLng: `${this.config.channel.latitude},${this.config.channel.longitude}`
              });
            }
          });
        }
      }

      // Sort results by index position - i.e. relevancy
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

  doGeoSearch(obj: any): void {
    this.router.navigate(['/restaurants', 'map', obj.latLng], { queryParams: { label: obj.name }})
      .then(() => this.closeSearchForm());

  }
  doCuisineSearch(obj: any): void {
    this.router.navigate([
      '/restaurants',
      'map',
      obj.latLng,
      obj.name
    ])
      .then(() => this.closeSearchForm());
  }

  closeSearchForm(): void {
    this.dialog.close();
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
    this.closeSearchForm();
  }
}

