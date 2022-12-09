import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { NavigationEnd, Router, Event as NavigationEvent, ActivatedRoute } from '@angular/router';
import { fadeIn } from '../../../shared/animations';
import { RestaurantsService } from '../../../restaurants/restaurants.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchFormComponent } from '../../../restaurants/search/search-form.component';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html',
  animations: [fadeIn]
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
    private route: ActivatedRoute,
    private dialog: MatDialog
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
    const dialogRef = this.dialog.open(SearchFormComponent, {
      position: {'top': '15vh'},
      backdropClass: 'rd-backdrop',
      panelClass: 'rd-search-dialog'
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
    this.router.navigate(path, { queryParams: { label: this.geoSearchLabel || ''} }).then();
  }
}

