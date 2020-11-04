import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api.service';

interface SearchSuggestion {
  cat: string;
  name: string;
  index: number;
  route?: string[];
  spw?: string;
  misc?: any;
}
interface Restaurant {
  restaurant_name: string;
  restaurant_number: string;
  restaurant_cuisine_1: string;
  restaurant_lat: number;
  restaurant_lng: number;
  restaurant_spw_url: string;
}
interface Landmark {
  name: string;
  lat: number;
  lng: number;
}
interface Cuisine {
  label: string;
  total: number;
}
interface Location {
  label?: string;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})

export class SearchComponent implements OnInit {
  isLoaded = false;
  restaurantsLoaded = false;

  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  // Confic
  apiAccessCode = 'FR0100';
  apiKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
  lat = 43.695;
  lng = 7.266;
  minChars = 1;
  icons = {
    location: 'location_on',
    cuisine: 'restaurant',
    restaurant: 'food_bank',
    nearest: 'my_location',
    takeaway: 'fastfood',
    recent: 'watch_later'
  };

  restaurants: Restaurant[] = [];
  landmarks: Landmark[] = [];
  searchSuggestions: SearchSuggestion[] = [];
  cuisines: Cuisine[] = [];

  currentLocation: Location = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getCurrentLocation();
    this.getSummary();
    this.getRestaurants();
    this.getLandmarks();
    // So that we can focus the input field
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
      this.isLoaded = true;
    }, 500);
  }

  getRecentlyViewed(): void {

  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  // Load restaurants
  getRestaurants(): void {
    this.api.getRestaurants(this.apiAccessCode, this.apiKey, 'not used',
      this.lat, this.lng).subscribe(
      (data: any) => {
        this.restaurants = data.restaurants;
        this.restaurantsLoaded = true;
        console.log('Rests', this.restaurants);
      },
      (error: object) => {
        console.log(error);
      });
  }

  // Load landmarks
  getLandmarks(): void {
    this.api.getChannelLandmarks(this.apiAccessCode, this.apiKey).subscribe(
      (data: any) => {
        this.landmarks = data.landmarks;
        console.log(data, this.landmarks);
      },
      (error: object) => {
        console.log(error);
      });
  }

  // Get summary data
  getSummary(): void {
    this.api.getRestaurantsSummary(this.apiAccessCode, this.apiKey, this.lat, this.lng).subscribe(
      (data: any) => {
        console.log(data);
        this.setCuisines(data.cuisines);
      },
      (error: object) => {
        console.log(error);
      }
    );
  }

  setCuisines(arr: any): void {
    console.log(arr);
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

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  computeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  doSearch(str: string): void {
    // Scroll window to maximise room for search suggestions
    window.scrollTo(0, 64);

    if (str.length >= this.minChars) {
      // set uppercase version for string matching
      const ucString = str.toUpperCase();
      // clear current suggestions
      this.searchSuggestions = [];

      // Check for matching landmarks
      if (!!this.landmarks) {
        let i = this.landmarks.length - 1; let m;
        while (i--) {
          m = this.landmarks[i];
          if (m.name.toUpperCase().includes(ucString)) {
            // Add SearchSuggestion
            this.searchSuggestions.push({
              name: m.name,
              cat: 'location',
              index: m.name.toUpperCase().indexOf(ucString),
              route: ['/restaurants/nearest/', `${m.lat}:${m.lng}`]
            });
          }
        }
      }
      // Check for matching restaurants
      if (!!this.restaurants) {
        let i = this.restaurants.length - 1; let r;
        while (i--) {
          r = this.restaurants[i];
          if (r.restaurant_name.toUpperCase().includes(ucString)) {
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
