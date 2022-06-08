import { Component, OnInit } from '@angular/core';
import { RestaurantsSearchService } from './restaurants-search.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {LocationService} from '../../core/location.service';


@Component({
  selector: 'rd-list-view',
  templateUrl: './list-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class ListViewComponent implements OnInit {

  restaurants$: Observable<any[]>;
  filterBy?: string | null;
  sortBy?: string | null;
  isLoaded = false;
  mapLatLng!: string[];
  userPosition: any;

  constructor(
    private route: ActivatedRoute,
    private location: LocationService,
    private restService: RestaurantsSearchService
  ) {
    this.restaurants$ = this.restService.restaurants;
  }

  ngOnInit(): void {
    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );
    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      this.mapLatLng = params.get('geo')?.split(',') ?? [];
      this.filterBy = params.get('filter');
      this.sortBy = params.get('sort');
    });
    // Load restaurant results
    this.restService.loadRestaurants({
      lat: this.mapLatLng[0],
      lng: this.mapLatLng[1],
      sortBy: this.sortBy
    });
  }
  loadMore(): void {

  }
  openSpw(restaurant: any): void {}
  // Todo: we need to store on the Cloudinary ids so that
  //  we an appropriately sized & formatted image
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }
}
