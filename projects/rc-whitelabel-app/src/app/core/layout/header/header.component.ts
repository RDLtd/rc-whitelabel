import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import {NavigationEnd, Router, Event as NavigationEvent, NavigationStart, ActivatedRoute} from '@angular/router';
import { filter } from 'rxjs/operators';
import { fadeIn } from '../../../shared/animations';
import { RestaurantsService } from '../../../features/restaurants/restaurants.service';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html',
  animations: [fadeIn]
})

export class HeaderComponent implements OnInit {

  // @Input() direction = '';
  showSearchOption = false;
  showViews = false;
  isMapView = true;
  geoSearchLabel?: string;

  constructor(
    public config: AppConfig,
    private router: Router,
    private restService: RestaurantsService,
    private route: ActivatedRoute
  ) {
    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if(event instanceof NavigationStart) {
            this.isMapView = event.url.indexOf('map') > 0;
          }
        });
    this.route.queryParams.subscribe((params) => {
      if (!!params.location) {
        this.geoSearchLabel = params.location;
      }
    })
  }

  ngOnInit(): void {
    // Hide the search option when on the search page
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // console.log(this.router.url);
        this.showSearchOption = this.router.url !== '/';
    });
    this.restService.restaurants.subscribe(res => {
      this.showViews = res.length > 0;
    });
  }

  /**
   * We have to extract the query params
   * and add them back otherwise Angular
   * escapes them in the url
   * @param view - the target view
   */
  toggleView(view: string): void {
    // Ignore the query params and split the url into its parts
    let path = this.router.url.split('?')[0].split('/');
    // Replace the view element
    path[2] = view;
    this.restService.resetRestaurantsSubject();
    // console.log(path);
    // navigate to the new view, passing any query params
    this.router.navigate(path, { queryParams: { location: this.geoSearchLabel || ''} }).then();
  }
}

