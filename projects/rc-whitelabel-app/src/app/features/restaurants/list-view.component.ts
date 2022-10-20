import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from './restaurants.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';
import { ActivatedRoute, ParamMap} from '@angular/router';
import { LocationService } from '../../core/location.service';
import { AppConfig } from '../../app.config';
import { DataService } from '../../core/data.service';
import { Title } from '@angular/platform-browser';

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

  // url params
  routeFilter: any;
  routeSort: any;
  // filters
  showFilterOptions = false;
  filtersOn = false;
  landmarks: any[] = [];
  cuisines: any[] = [];
  features: any[] = [];
  // restaurant results
  restaurants: any[] = [];
  nextRestaurants: any[] = [];

  constructor(
    public config: AppConfig,
    private route: ActivatedRoute,
    private location: LocationService,
    private restService: RestaurantsService,
    private data: DataService,
    private title: Title
  ) {
      title.setTitle('Restaurant Results List');

      this.restaurants$ = this.restService.restaurants;
      this.resultsLoaded$ = this.restService.resultsLoaded;
      this.moreRestaurantsPreloaded = this.restService.moreRestaurantResults;

      this.clearFilters();
  }

  ngOnInit(): void {

    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );



    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      this.isLoaded = false;
      this.geoTarget = params.get('latLng')?.split(',') ?? [];
      this.filterBy = params.get('filter');
      this.sortBy = params.get('sort');
    });

    // Load restaurant results
    this.restService.loadRestaurants({
      lat: this.geoTarget[0],
      lng: this.geoTarget[1],
      filter: !!this.filterBy ? 'cuisine' : '',
      filterText: this.filterBy
    });

    // load summary for filter/sort options
    this.data.loadSummarisedData().then((res: any) => {
      // console.log('Summary loaded', res);
      this.landmarks = res.landmarks;
      this.cuisines = res.cuisines;
      this.features = res.features;
    });
  }

  loadMore(): void {
    this.restService.loadMoreRestaurants();
  }

  openSpw(restaurant: any): void {
    // console.log(restaurant);
    this.restService.openSpw(restaurant, 'results_list_card');
  }

  // Todo: we need to store on the Cloudinary ids so that
  //  we an appropriately sized & formatted image
  getFormattedImage(url: string): string {
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }

  // If we have multiple cuisine types
  // or multiple POIs show filter options
  showFilterBtn(): void {
    if (this.cuisines.length > 1 || this.landmarks.length) {
      this.showFilterOptions = true;
    } else {
      console.log('No filters available');
    }
  }
  clearFilters(): void {
    //this.router.navigate(['/restaurants']).then();
    this.filtersOn = false;
    this.showFilterOptions = false;
    this.showFilterBtn();
  }
}
