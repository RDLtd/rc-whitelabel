import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class LocationService {

  private userLocationSubject = new BehaviorSubject<any>({});

  constructor(
    private config: AppConfig,
    private api: ApiService
  ) {

    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition((geo: Position) => {
        this.api.getRestaurantsNear(this.config.channel.accessCode, this.config.channel.apiKey,
          geo.coords.latitude, geo.coords.longitude, this.config.maxDistance)
          .toPromise()
          .then((res: any) => {
            this.userLocationSubject.next({
              lat: geo.coords.latitude,
              lng: geo.coords.longitude,
              distance: res !== null ? res.distance : 'Not in range',
              inRange: res !== null ? res.near : false
            });
          })
          .catch((error: any) => {
            console.log('ERROR', error);
          });
      }, (error: PositionError) => {
        console.log(error);
      });
    }
  }

  get userLocationObs(): Observable<any> {
    return this.userLocationSubject.asObservable();
  }

}
