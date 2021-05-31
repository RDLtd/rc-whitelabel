import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({opacity: 0}),
    animate('500ms', style({opacity: 1})),
  ])
]);

export const fadeInSlideUp = trigger('fadeInSlideUp', [
  transition(':enter', [
    style({opacity: 0, transform: 'translateY(12px)'}),
    animate('300ms ease-out', style({opacity: 1, transform: 'translateY(0)'})),
  ])
]);

export const fadeInStagger = trigger('fadeInStagger', [
  transition('* => *', [ // each time the binding value changes
    query(':enter', [
      style({opacity: 0, transform: 'translateY(12px)'}),
      stagger(100, [
        animate('300ms', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ])
]);
