import { AfterViewInit, Component, HostBinding, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, share, throttleTime } from 'rxjs/operators';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

enum Direction {
  Up = 'Up',
  Down = 'Down'
}

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html',
  styles: [
    `
      :host {
        position: fixed;
        top: 0;
        width: 100%;
        height: 64px;
      }
    `
  ],
  animations: [
    trigger('toggle', [
      state(
        VisibilityState.Hidden,
        style({ opacity: 1, transform: 'translateY(-100%)' })
      ),
      state(
        VisibilityState.Visible,
        style({ opacity: 1, transform: 'translateY(0)' })
      ),
      transition('* => *', animate('200ms ease-out'))
    ])
  ]
})
export class HeaderComponent implements OnInit, AfterViewInit {

  private isVisible = true;

  constructor() { }

  ngOnInit(): void {
  }

  @HostBinding('@toggle')
  get toggle(): VisibilityState {
    return this.isVisible ? VisibilityState.Visible : VisibilityState.Hidden;
  }

  ngAfterViewInit(): void {
    const scroll$ = fromEvent(window, 'scroll').pipe(
      throttleTime(10),
      map(() => window.pageYOffset),
      pairwise(),
      map(([y1, y2]): Direction => (y2 < y1 ? Direction.Up : Direction.Down)),
      distinctUntilChanged(),
      share()
    );

    const scrollUp$ = scroll$.pipe(
      filter(direction => direction === Direction.Up)
    );

    const scrollDown = scroll$.pipe(
      filter(direction => direction === Direction.Down)
    );

    scrollUp$.subscribe(() => (this.isVisible = true));
    scrollDown.subscribe(() => (this.isVisible = false));
  }
}

