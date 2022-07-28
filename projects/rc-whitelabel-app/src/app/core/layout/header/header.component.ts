import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { fadeIn } from '../../../shared/animations';
import {RestaurantsService} from '../../../features/restaurants/restaurants.service';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html',
  animations: [fadeIn]
})

export class HeaderComponent implements OnInit {

  // @Input() direction = '';
  showSearchOption = false;

  constructor(
    public config: AppConfig,
    private router: Router,
    private restService: RestaurantsService
  ) { }

  ngOnInit(): void {
    // Hide the search option when omn the search page
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // console.log(this.router.url);
        this.showSearchOption = this.router.url !== '/search';
    });
  }
  switchView(view: string): void {
    let path = this.router.url.split('/');
    path[2] = view;
    this.restService.resetRestaurantsSubject();
    this.router.navigate(path).then();
  }

}

