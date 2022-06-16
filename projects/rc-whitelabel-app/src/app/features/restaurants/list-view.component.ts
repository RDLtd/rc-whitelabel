import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from './restaurants.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';
import { ActivatedRoute, ParamMap} from '@angular/router';
import { LocationService } from '../../core/location.service';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rd-list-view',
  templateUrl: './list-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class ListViewComponent implements OnInit {

  restaurants$: Observable<any[]>;
  resultsLoaded$: Observable<boolean>;
  filterBy?: string | null;
  sortBy?: string | null;
  isLoaded = false;
  geoTarget!: string[];
  userPosition: any;
  moreRestaurantsPreloaded: Observable<boolean>;

  constructor(
    public config: AppConfig,
    private route: ActivatedRoute,
    private location: LocationService,
    private restService: RestaurantsService
  ) {
      this.restaurants$ = this.restService.restaurants;
      this.resultsLoaded$ = this.restService.resultsLoaded;
      this.moreRestaurantsPreloaded = this.restService.moreRestaurantResults;
  }

  ngOnInit(): void {
    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );
    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      this.geoTarget = params.get('geo')?.split(',') ?? [];
      this.filterBy = params.get('filter');
      this.sortBy = params.get('sort');
    });
    // Load restaurant results
    this.restService.loadRestaurants({
      lat: this.geoTarget[0],
      lng: this.geoTarget[1]
    });
  }
  loadMore(): void {
    this.restService.loadMoreRestaurants();
  }
  openSpw(restaurant: any): void {}
  // Todo: we need to store on the Cloudinary ids so that
  //  we an appropriately sized & formatted image
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }
}
