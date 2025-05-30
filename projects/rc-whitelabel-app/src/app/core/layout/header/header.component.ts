import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { NavigationEnd, Router, Event as NavigationEvent, ActivatedRoute } from '@angular/router';
import { fadeIn } from '../../../shared/animations';
import { RestaurantsService } from '../../../restaurants/restaurants.service';

@Component({
    selector: 'rd-header',
    templateUrl: './header.component.html',
    animations: [fadeIn],
    standalone: false
})

export class HeaderComponent implements OnInit {

  // @Input() direction = '';
  showSearchOption = true;
  showViews = false;
  isDeepLink = false;
  defaultRoute = '/restaurants';
  isMapView = true;
  geoSearchLabel?: string;

  constructor(
    public config: AppConfig,
    private router: Router,
    private restService: RestaurantsService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {

    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if(event instanceof NavigationEnd) {
            const url = this.router.url;
            this.isDeepLink = url !== this.defaultRoute;
            this.isMapView = event.url.indexOf('map') > 0;
          }
        });

    this.route.queryParams.subscribe((params) => {
      if (!!params.label) {
        this.geoSearchLabel = params.label;
      }
    });

    this.restService.restaurants.subscribe(res => {
      this.showViews = res.length > 0 && this.isDeepLink;
    });
  }

  openSearchForm(): void {
    this.restService.openSearchForm()
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
    this.router.navigate(path, { queryParams: { label: this.geoSearchLabel || ''} }).then();
  }
  reset(): void {
    console.log(this.router.url);
    if(this.router.url === '/restaurants'){ return; }
    this.restService.resetAll();
    this.router.navigateByUrl('/restaurants').catch((error => console.log(error)));
  }
}

