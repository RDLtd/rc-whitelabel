import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from './restaurants.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import { LocationService } from '../../core/location.service';
import { AppConfig } from '../../app.config';
import { DataService } from '../../core/data.service';
import { Title } from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'rd-list-view',
  templateUrl: './list-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})
export class ListViewComponent implements OnInit {

  restaurants$: Observable<any[]>;
  resultsLoaded$: Observable<boolean>;
  searchFilter?: string | null;
  sortBy?: string | null;
  isLoaded = false;
  geoTarget: any;
  geoSearchLabel?: string;
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
  // nextRestaurants: any[] = [];
  // totalRestaurants = 0;

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

    // subscribe to results observers
    this.restaurants$ = this.restService.restaurants;
    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.moreRestaurantsPreloaded = this.restService.moreRestaurantResults;

  }

  ngOnInit(): void {

    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      // Geo search target
      this.geoTarget = {
        lat: Number(params.get('latLng')?.split(',')[0] ?? this.config.channel.centre.lat).toFixed(6),
        lng: Number(params.get('latLng')?.split(',')[1] ?? this.config.channel.centre.lng).toFixed(6)
      };
      // Add latLng
      this.geoTarget.coords = `${this.geoTarget.lat},${this.geoTarget.lng}`;
      // Check for cuisine filter
      this.searchFilter = params.get('filter');
      this.filtersOn = !!this.searchFilter;
      // Add target label
      this.route.queryParams.subscribe(params => {
        if (!!params.location) {
          this.geoTarget.label = params.location ?? null;
        }
      });
      // update service
      this.restService.searchParams = {
        lat: this.geoTarget.lat,
        lng: this.geoTarget.lng,
        filter: !!this.searchFilter ? 'cuisine' : null,
        filterText: this.searchFilter,
        location: this.geoTarget.label
      }

      this.restService.geo = {
        label: this.geoTarget.label,
        lat: this.geoTarget.lat,
        lng: this.geoTarget.lng,
        coords: this.geoTarget.coords
      }
      this.restService.filter = params.get('filter') || null;

      // load summary for filter/sort options
      this.restService.loadSummarisedResults(this.geoTarget.lat, this.geoTarget.lng);

      // Delay the filter options until results have loaded
      setTimeout(() => {
        this.showFilterOptions = true;
      }, 2000);

      // Now load restaurant results
      this.restService.loadRestaurants({
        lat: this.geoTarget.lat,
        lng: this.geoTarget.lng,
        filter: !!this.searchFilter ? 'cuisine' : '',
        filterText: this.searchFilter,
        offset: 0
      });
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
}
