import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from './restaurants.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../shared/animations';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LocationService } from '../core/location.service';
import { AppConfig } from '../app.config';
import { DataService } from '../core/data.service';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'rd-list-view',
  templateUrl: './list-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class ListViewComponent implements OnInit {

  restaurants$: Observable<any[]>;
  resultsLoaded$: Observable<boolean>;

  userPosition: any;
  moreRestaurantsPreloaded: Observable<boolean>;

  // filters
  searchFilter!: string | null;
  filterOn = false;
  showFilters = false;

  landmarks: any[] = [];
  cuisines: any[] = [];
  features: any[] = [];
  restaurants: any[] = [];

  constructor(
    public config: AppConfig,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationService,
    private restService: RestaurantsService,
    private data: DataService,
    private title: Title,
    public dialog: MatDialog,
  ) {

    // page title
    this.title.setTitle('Restaurant Results List');

    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos);

    // subscribe to the results observers
    this.restaurants$ = this.restService.restaurants;
    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.moreRestaurantsPreloaded = this.restService.moreRestaurantResults;

  }

  ngOnInit(): void {

    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {

      // If this is not a deep link load our default home view
      if (params.get('latLng') === null) {
        // We may need to reset the restaurant results
        // if the user has already interacted with the site
        this.restService.resetRestaurantsSubject();
        // Display features restaurants
        this.restService.loadFeaturedRestaurants();
        return;
      }

      const latLng = params.get('latLng')?.split(',') ?? [];
      this.searchFilter = params.get('filter') ?? null;

      this.route.queryParams.subscribe(queryParams => {
        // Update geoTarget
        this.restService.geo = {
          lat: Number(latLng[0]).toFixed(6),
          lng: Number(latLng[1]).toFixed(6),
          label: queryParams.label
        }
        // Update search params
        this.restService.searchParams = {
          lat: this.restService.geoLatitude,
          lng: this.restService.geoLongitude,
          filter: this.searchFilter !== null ? 'cuisine' : null,
          filterText: this.searchFilter?.split(','),
          label: this.restService.geoLabel
        }
      });

      // load summary for filter/sort options
      this.restService.loadSummarisedResults();

      // Now load restaurant results
      this.restService.loadRestaurants({offset: 0});

      this.showFilters = true;
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
  getFormattedImage(url: string): string | boolean {
    if(!url) {
      console.log('ERROR: No image url provided');
      return false;
    }
    console.log(`getFormattedImage(${url})`);
    const format = 'w_900,h_600,c_fill,q_auto,dpr_auto,f_auto';
    return url.replace('upload/', `upload/${format}/`);
  }
}
