import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
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

  // Number of chars user must type for auto-suggest to kick in
  minSearchChars = 1;
  // zero suggestions
  noSuggestions = false;
  // Set as positive number to restrict the number of suggestions displayed
  maxSuggestions = null;
  // The search input string
  searchStr?: string;
  // Number of results
  searchItemsCount = 0;
  // Designated nav keys to act on
  listNavKeys = [40, 39, 38, 37, 9, 13];

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
  // features: any[] = [];
  searchSuggestions: SearchSuggestion[] = [];
  // cuisines: Cuisine[] = [];
  // recentlyViewed: any[] = [];

  // User location
  userPosition: any | undefined;

  // Channel search config
  channelConfig = {
    channelType: 3,
    defaultView: 'list',
    showRecentlyViewed: false,
    showLandmarks: true,
    showCuisines: false,
    searchPlaceholderTxt: 'Type a location, postcode or restaurant name',
    noResultsTxt: 'No matches'
  };

  // ks 230123 some cheat stuff for testing...
  @HostListener('window:keydown', ['$event'])
  handleKeyDown($event: KeyboardEvent): void {
    if (($event.ctrlKey || $event.metaKey) && $event.key === 's') {
      console.log('Search');
      // @ts-ignore
      this.data.loadSearchRestaurants(document.getElementById('searchInput').value)
        .then((res: any) => {
          console.log(res);
        })
        .catch((error: Error) => {
          console.log(`ERROR: ${error}`);
        });
    }
    if (($event.ctrlKey || $event.metaKey) && $event.key === 'q') {
      console.log('Quick Search');
      // @ts-ignore
      this.data.loadQuickSearchRestaurants(document.getElementById('searchInput').value)
        .then((res: any) => {
          console.log(res);
        })
        .catch((error: Error) => {
          console.log(`ERROR: ${error}`);
        });
    }
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
    public dialog: MatDialogRef<any>,
    private elemRef: ElementRef
  ) {
  }

  ngOnInit(): void {

    // Observe user's position
    this.location.userLocationObs.subscribe((userPos) => {
      this.userPosition = userPos;
    });

    this.loadSummarisedResults();

    // Get recent restaurants
    // this.recentlyViewed = this.storageService.get('rdRecentlyViewed');

  }

  ngAfterViewInit(): void {

    // pre-focus the search input
    this.rdSearchInput.nativeElement.focus();

    // Set up keyboard navigation for the
    // auto-suggestion results list.
    // First, reference the UI container
    const autoSuggest = this.elemRef.nativeElement.querySelector('.rd-search-autofill-container');

    let itemsTotal = 0;
    let itemIndex = 0;
    let itemSelected;
    let itemTarget: any;
    let lastItem: any | null;

    // listen for our designated navigation keys
    autoSuggest.addEventListener('keyup', (event: any) => {
      // console.log(`Key: ${event.which}`);

      // reference our results list array
      const itemsList = autoSuggest.getElementsByTagName('li');
      itemsTotal = this.searchSuggestions.length;

      // Is it a key we're interested in?
      if (this.listNavKeys.includes(event.which)) {
        switch (event.which) {
          // arrow-down, arrow-right, tab
          case 40:
          case 39:
          case 9:
            itemIndex++;
            break;
          // arrow-up, arrow-left
          case 37:
          case 38:
            itemIndex--;
            break;
          // enter
          case 13:
            itemTarget.click();
            break;
          default:
            return;
        }

        // reset the counter if it's the 1st or last item
        if (itemIndex === itemsTotal) { itemIndex = 0; }
        if (itemIndex === -1) { itemIndex = (itemsTotal - 1); }

      } else {
        // Otherwise, we need to reset our index
        itemIndex = 0;
      }

      // Are there any suggestion items?
      if (itemsList.length > 0) {

        // set the targets
        itemSelected = itemsList[itemIndex];
        itemTarget = itemSelected.querySelector('a');

        // clear the last selection
        if (!!lastItem) { lastItem.classList.remove('rd-search-item-selected'); }

        // highlight selected item
        itemSelected.classList.add('rd-search-item-selected');
        lastItem = itemSelected;
      }

    });

  }

  loadSummarisedResults(): void {
    // Summarised data
    this.data.loadResultsSummary()
      .then((data: any) => {
      if ( data === null) {
        throw new Error(`No restaurants available within ${this.config.channel.boundary} of the Channel centre.`);
      }
      // console.log('LoadSummary', data);
      this.searchRestaurants = data.restaurants;
      this.landmarks = data.landmarks;
      this.isLoaded = true;
    })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
        this.isLoaded = true;
    });
  }

  getAutoSuggestions(str: string): void {

    // Scroll window to maximise room for search suggestions
    // window.scrollTo(0, 64);

    // Abort if there's no change to search string
    if (this.searchStr === str) { return; }

    this.searchStr = str;

    this.noSuggestions = false;

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
          matchPosition = item.channel_landmark_name.toUpperCase().search(regex);
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
      }

      // Sort results by index position - i.e. relevancy
      this.searchSuggestions.sort((a, b) => {
        return a.index - b.index;
      });

      if (this.maxSuggestions) { this.searchSuggestions.splice(this.maxSuggestions); }
      this.noSuggestions = this.searchSuggestions.length === 0;
      this.searchItemsCount = this.searchSuggestions.length;

    } else {
      // clear current suggestions
      this.searchSuggestions = [];
    }
  }

  /**
   * Search with latLng
   * @param obj latLng & name (a.k.a. label)
   */
  doGeoSearch(obj: any): void {
    this.router.navigate(['/restaurants', 'map', obj.latLng], { queryParams: { label: obj.name }})
      .then(() => this.closeSearchForm())
      .catch((error) => console.log(`ERROR: ${error}`));
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
    this.searchReset();
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
      'open_spw', `spw/${restName.replace(/\s/g , '-')}`,
      0);
    window.open(restaurant.spw || restaurant.restaurant_spw_url, '_blank');
    this.closeSearchForm();
  }
}
