import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from '../../channel.service';

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {

  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  searchString = '';
  isLoaded = false;
  apiAccessCode = 'FR0100';
  apiKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
  landmarks: any;
  summary: any;

  constructor(private api: ChannelService) {
  }

  ngOnInit(): void {

    this.getChannelInfo();
    this.getRestaurantSummary();
    this.getLandmarks();

    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
      this.isLoaded = true;
    }, 500);

  }

  search(val: string): void {
    console.log('SEARCH', val);
  }

  getChannelInfo(): void {
    this.api.getChannelInfo(this.apiAccessCode, this.apiKey).subscribe(
      (data: object) => {
        console.log(data);
      },
      (error: object) => {
        console.log(error);
      });
  }
  getRestaurantSummary(): void{
    const lat = 43.695;
    const lng = 7.266;
    this.api.getRestaurantsSummary(this.apiAccessCode, this.apiKey, lat, lng).subscribe(
      (data: any) => {
        console.log(data);
        this.summary = data;
        this.setCuisines();
      },
      (error: object) => {
        console.log(error);
      });
  }
  getLandmarks(): void {
    this.api.getChannelLandmarks(this.apiAccessCode, this.apiKey).subscribe(
      (data: any) => {
        // console.log(data.landmarks);
        this.landmarks = data.landmarks;
        console.log(this.landmarks);
      },
      (error: object) => {
        console.log(error);
      });
  }

  setCuisines(): void {
    console.log(this.summary.cuisines);
  }
}
