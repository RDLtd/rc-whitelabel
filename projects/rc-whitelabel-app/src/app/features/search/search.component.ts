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

  searchString = '';
  restaurants: RestaurantElement[] | undefined;
  landmarks: LandmarkElement[] | undefined;
  displayList: DisplayElement[] | undefined;

  constructor(private channelService: ChannelService) { }

  ngOnInit(): void {
    //
    // get the core set of restaurants so we can start to do the search
    //
    // for now just setting up the parameters locally... Indeed, how WILL we set these up?
    const channelAccessCode = 'FR0100';
    const channelAccessAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
    const lat = 43.695;
    const lng = 7.266;
    this.channelService.getRestaurants(channelAccessCode, channelAccessAPIKey, 'test', lat, lng).subscribe(
      (data: RestaurantDataElement) => {
        this.restaurants = data.restaurants;
        console.log(data, this.restaurants);
      },
      (error: object) => {
        console.log(error);
      });

    // also get the landmarks
    this.channelService.getChannelLandmarks(channelAccessCode, channelAccessAPIKey).subscribe(
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


    interface Employee {
      name: string;
      code: number;
    }
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
            console.log(landmark.name);
            jsonData.name = landmark.name;
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
            console.log(restaurant.restaurant_name);
            jsonData.name = restaurant.restaurant_name + '(' + restaurant.restaurant_cuisine_1 + ')';
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
            console.log(restaurant.restaurant_name);
            jsonData.name = restaurant.restaurant_name;
            jsonData.icon = 'restaurant ';
            jsonData.index = restaurant.restaurant_name.toUpperCase().indexOf(this.searchString.toUpperCase());
            this.displayList.push(jsonData);
          }
        }
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

  doTest(index: number): void {
    // tslint:disable-next-line:variable-name
    const channel_access_code = 'FR0100';
    // tslint:disable-next-line:variable-name
    const channel_access_api_key = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
    switch (index) {
      case 1: {
        this.channelService.getChannelInfo(channel_access_code, channel_access_api_key).subscribe(
          // tslint:disable-next-line:no-any
          (data: any) => {
            console.log(data);
          },
          // tslint:disable-next-line:no-any
          (error: any) => {
            console.log(error);
          });
        break;
      }
      case 2: {
        this.channelService.getChannelLandmarks(channel_access_code, channel_access_api_key).subscribe(
          // tslint:disable-next-line:no-any
          (data: any) => {
            console.log(data);
          },
          // tslint:disable-next-line:no-any
          (error: any) => {
            console.log(error);
          });
        break;
      }
      case 3: {
        const params = 'test';
        const lat = 43.695;
        const lng = 7.266;
        this.channelService.getRestaurantsSummary(channel_access_code, channel_access_api_key, lat, lng).subscribe(
          // tslint:disable-next-line:no-any
          (data: any) => {
            console.log(data);
          },
          // tslint:disable-next-line:no-any
          (error: any) => {
            console.log(error);
          });
        break;
      }
    }

  }

}
