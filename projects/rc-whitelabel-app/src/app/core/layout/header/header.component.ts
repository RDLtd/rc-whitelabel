import { Component, Input, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { fadeIn } from '../../../shared/animations';

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
    private router: Router
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
    path[path.length - 1] = view;
    console.log(path);
    this.router.navigate(path);
  }

}

