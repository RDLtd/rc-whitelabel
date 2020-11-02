import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from '../../channel.service';

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {

  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  searchString = '';

  constructor(private channelService: ChannelService) { }

  ngOnInit(): void {
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 100);
  }

  search(val: string): void {
    console.log('SEARCH', val);
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
        this.channelService.getRestaurants(channel_access_code, channel_access_api_key, params, lat, lng).subscribe(
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
