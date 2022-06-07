import { Component, OnInit } from '@angular/core';
import { RestaurantsSearchService } from './restaurants-search.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';

@Component({
  selector: 'rd-list-view',
  templateUrl: './list-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class ListViewComponent implements OnInit {

  restaurants$: Observable<any[]>;
  routeFilter = null;
  routeSort = null;

  constructor(
    private restService: RestaurantsSearchService
  ) {
    this.restaurants$ = this.restService.restaurants;
  }

  ngOnInit(): void {
    this.restService.searchRestaurants({
      batchSize: 10,
      offset: 0,
      testing: false,
      geoLocation: { lat: '51.7521849865759', lng: '-1.2579775767154544' }
    });
  }
  openSpw(restaurant: any): void {}
  // Todo: we need to store on the Cloudinary ids so that
  //  we an appropriately sized & formatted image
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }
}
