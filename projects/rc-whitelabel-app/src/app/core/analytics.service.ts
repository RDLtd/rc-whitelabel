import { Injectable } from '@angular/core';

declare let gtag:Function;

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  constructor() { }

  public eventEmitter(
    eventName: string,
    eventCategory: string,
    eventAction: string,
    eventLabel: string = '',
    eventValue: number = 0 ){
    gtag('event', eventName, {
      eventCategory,
      eventLabel,
      eventAction,
      eventValue
    })
  }
}
