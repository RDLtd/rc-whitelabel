import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { NavigationEnd, Router, Event as NavigationEvent, NavigationStart } from '@angular/router';
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

  constructor(
    public config: AppConfig,
    private router: Router,
    private restService: RestaurantsService,
  ) {
    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if(event instanceof NavigationStart) {
            this.isMapView = event.url.indexOf('map') > 0;
          }
        });
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
  switchView(view: string): void {
    let path = this.router.url.split('/');
    path[2] = view;
    console.log('V', view);
    this.restService.resetRestaurantsSubject();
    this.router.navigate(path).then();
  }

}

