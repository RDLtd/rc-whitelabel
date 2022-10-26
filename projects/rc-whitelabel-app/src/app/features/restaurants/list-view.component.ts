import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from './restaurants.service';
import { Observable } from 'rxjs';
import { fadeInSlideUp, fadeInStagger } from '../../shared/animations';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import { LocationService } from '../../core/location.service';
import { AppConfig } from '../../app.config';
import { DataService } from '../../core/data.service';
import { Title } from '@angular/platform-browser';
import {FilterOptionsDialogComponent} from './filter-options-dialog.component';
import {MatDialog} from '@angular/material/dialog';

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
  geoTarget: any;
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
  totalRestaurants = 0;
  boundary?: number;

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
      title.setTitle('Restaurant Results List');

      this.restaurants$ = this.restService.restaurants;
      this.resultsLoaded$ = this.restService.resultsLoaded;
      this.moreRestaurantsPreloaded = this.restService.moreRestaurantResults;

      this.clearFilters();
  }

  ngOnInit(): void {

    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );

    // Get the geographical centre of the channel
    this.boundary = this.config.channel.boundary;



    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.isLoaded = false;
      this.geoTarget = {
        lat: params.get('latLng')?.split(',')[0] ?? this.config.channel.centre.lat,
        lng: params.get('latLng')?.split(',')[1] ?? this.config.channel.centre.lng
      };
      this.filterBy = params.get('filter');
      this.sortBy = params.get('sort');
    });

    // load summary for filter/sort options
    this.restService.loadSummarisedResults(this.geoTarget, this.boundary);
    // Delay the filter options until results have loaded
    setTimeout(() => { this.showFilterOptions = true; }, 1500);

    // Load restaurant results
    this.restService.loadRestaurants({
      lat: this.geoTarget.lat,
      lng: this.geoTarget.lng,
      filter: !!this.filterBy ? 'cuisine' : '',
      filterText: this.filterBy,
      offset: 0
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

  // Sort and filter dialog
  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.restService.cuisineSummary,
        landmarks: this.restService.landmarkSummary,
        userPosition: this.userPosition
      },
      panelClass: 'rd-filter-dialog'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('Dialog', result);
      const coords = `${result.lat},${result.lng}`;
      if (!!result) {
        if (result.type === 'filter') {
          this.router.navigate(['/restaurants', 'list', `${this.geoTarget.lat},${this.geoTarget.lng}`, result.value]).then();
        } else if (result.type === 'sort') {
          console.log('sort');
          this.router.navigate(['/restaurants', 'map', coords]).then();
        }
      }
    });
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
