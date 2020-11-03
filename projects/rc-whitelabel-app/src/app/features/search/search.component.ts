import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from '../../channel.service';

interface DisplayElement {
  name: string;
  icon: string;
  index: number;
}

interface RestaurantDataElement {
  restaurants: RestaurantElement[] | undefined;
}

interface RestaurantElement {
  restaurant_name: string;
  restaurant_number: string;
  restaurant_cuisine_1: string;
  restaurant_lat: number;
  restaurant_lng: number;
}

interface LandmarkDataElement {
  landmarks: LandmarkElement[] | undefined;
}

interface LandmarkElement {
  name: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})

export class SearchComponent implements OnInit {

  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  // for now just setting up the parameters locally... Indeed, how WILL we set these up?
  channelAccessCode = 'FR0100';
  channelAccessAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
  lat = 43.695;
  lng = 7.266;

  searchString = '';
  restaurants: RestaurantElement[] | undefined;
  landmarks: LandmarkElement[] | undefined;
  displayList: DisplayElement[] | undefined;

  constructor(private channelService: ChannelService) { }

  ngOnInit(): void {
    //
    // get the core set of restaurants so we can start to do the search
    //
    this.channelService.getRestaurants(this.channelAccessCode, this.channelAccessAPIKey, 'not used',
      this.lat, this.lng).subscribe(
      (data: RestaurantDataElement) => {
        this.restaurants = data.restaurants;
        console.log(data, this.restaurants);
      },
      (error: object) => {
        console.log(error);
      });

    // also get the landmarks
    this.channelService.getChannelLandmarks(this.channelAccessCode, this.channelAccessAPIKey).subscribe(
      (data: LandmarkDataElement) => {
        this.landmarks = data.landmarks;
        console.log(data, this.landmarks);
      },
      (error: object) => {
        console.log(error);
      });

    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 100);
  }

  search(val: string): void {
    console.log('SEARCH', val);
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
  boldQuery(str: string, query: string): string {
    const n = str.toUpperCase();
    const q = query.toUpperCase();
    const x = n.indexOf(q);
    if (!q || x === -1) {
      return str; // bail early
    }
    const l = q.length;
    return str.substr(0, x) + '<b>' + str.substr(x, l) + '</b>' + str.substr(x + l);
  }

  doSearch(): void {
    // search through the data sets by location , cuisine and restaurant name
    //
    // set a default number of characters that must be present before a search is triggered
    const minimumChars = 2;
    if (this.searchString.length >= minimumChars) {
      console.log(this.searchString);
      // clear the display list
      this.displayList = [];
      // first check in the locations
      let jsonData: DisplayElement = { name: '', icon: '', index: 0 };
      // first the attributes
      if (this.landmarks && this.landmarks.length > 0) {
        for (const landmark of this.landmarks) {
          if (landmark.name.toUpperCase().includes(this.searchString.toUpperCase())) {
            jsonData = { name: '', icon: '', index: 0 };
            console.log(landmark.name + ' (' +
              this.computeDistance(this.lat, this.lng, landmark.lat, landmark.lng).toFixed(2) + 'km)');
            jsonData.name = landmark.name + ' (' +
              this.computeDistance(this.lat, this.lng, landmark.lat, landmark.lng).toFixed(2) + 'km)';
            jsonData.icon = 'location_on';
            jsonData.index = landmark.name.toUpperCase().indexOf(this.searchString.toUpperCase());
            this.displayList.push(jsonData);
          }
        }
      }
      // now cuisines
      if (this.restaurants && this.restaurants.length > 0) {
        for (const restaurant of this.restaurants) {
          if (restaurant.restaurant_cuisine_1.toUpperCase().includes(this.searchString.toUpperCase())) {
            jsonData = { name: '', icon: '', index: 0 };
            console.log(restaurant.restaurant_name + ' (' + restaurant.restaurant_cuisine_1 + ')');
            jsonData.name = restaurant.restaurant_name + ' (' + restaurant.restaurant_cuisine_1 + ')';
            jsonData.icon = 'food_bank';
            jsonData.index = restaurant.restaurant_cuisine_1.toUpperCase().indexOf(this.searchString.toUpperCase());
            this.displayList.push(jsonData);
          }
        }
      }
      // finally names - can't do this in the same loop as cuisines as want to keep the sections separate
      if (this.restaurants && this.restaurants.length > 0) {
        for (const restaurant of this.restaurants) {
          if (restaurant.restaurant_name.toUpperCase().includes(this.searchString.toUpperCase())) {
            jsonData = { name: '', icon: '', index: 0 };
            console.log(restaurant.restaurant_name  + ' (' +
              this.computeDistance(this.lat, this.lng,
                restaurant.restaurant_lat, restaurant.restaurant_lng).toFixed(2) + 'km)');
            jsonData.name = restaurant.restaurant_name + ' (' +
              this.computeDistance(this.lat, this.lng,
                restaurant.restaurant_lat, restaurant.restaurant_lng).toFixed(2) + 'km)';
            jsonData.icon = 'restaurant ';
            jsonData.index = restaurant.restaurant_name.toUpperCase().indexOf(this.searchString.toUpperCase());
            this.displayList.push(jsonData);
          }
        }
      }
      // make the search substring bold
      for (const displayElement of this.displayList) {
        displayElement.name = this.boldQuery(displayElement.name, this.searchString);
      }
      console.log(this.displayList);
      // need to contemplate how we might sort this list based things like where the search text was found...
      // we could store the position of the start of the search text and then sort based on that?
      // I now store that in the displayList as 'index'
      // plus limit the list, perhaps in each category like OpenTable?
    } else {
      // remove the search if we get back to less than the minimum number of characters
      this.displayList = [];
    }
  }
}
