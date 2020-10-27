import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HideableHeaderDirective } from 'ngx-hideable-header';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  @ViewChild(HideableHeaderDirective)
  hidableElement!: HideableHeaderDirective;

  constructor(private router: Router) { }

  ngOnInit(): void { }

  public hide(): void {
    this.hidableElement.hide();
  }

  show(): void {
    this.hidableElement.show();
  }


  openSPW(url: string): void {
    console.log('open:', url);
    window.open(url, '_blank');
  }

}
