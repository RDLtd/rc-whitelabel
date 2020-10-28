import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Reset page scroll
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  openSPW(url: string): void {
    console.log('open:', url);
    window.open(url, '_blank');
  }

}
