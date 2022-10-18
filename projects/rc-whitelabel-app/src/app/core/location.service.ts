import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConfig } from '../app.config';

export interface UserGeoLocation {
  lat?: number;
  lng?: number;
  distance: string;
  inRange: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class LocationService {
  private userLocationSubject = new BehaviorSubject<UserGeoLocation>({ inRange: false, distance: 'Unknown' });

  constructor(
    private config: AppConfig,
    private api: ApiService
  ) {

    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition((geo: any) => {
        this.api.getRestaurantsNear(this.config.channel.accessCode, this.config.channel.apiKey,
          geo.coords.latitude, geo.coords.longitude, this.config.maxUserDistance)
          .toPromise()
          .then((res: any) => {
            // console.log(res);
            this.userLocationSubject.next({
              lat: geo.coords.latitude,
              lng: geo.coords.longitude,
              distance: res.distance || `More than ${this.config.maxUserDistance}km`,
              inRange: res.near
            });
          })
          .catch((error: any) => {
            console.log('ERROR', error);
          });
      }, (error: any) => {
        console.log('ERROR', error);
      });
    } else {
      console.log('Geolocation not supported by the browser');
    }
  }

  get userLocationObs(): Observable<UserGeoLocation> {
    return this.userLocationSubject.asObservable();
  }

}
