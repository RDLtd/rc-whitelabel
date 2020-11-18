import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class LocationService {
  currentLocation: any;
  currentDistance: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  constructor() {  }

  getUserGeoLocation(): Observable<any> {
    return new Observable((observer) => {
      // Cached
      if (!!this.currentLocation) {
        observer.next(this.currentLocation);
      } else {
        // From browser
        if ('geolocation' in navigator) {
          navigator.geolocation.watchPosition((position: Position) => {
            this.currentLocation = position;
            observer.next(position);
          }, (error: PositionError) => {
            observer.error(error);
          });
        } else {
          observer.error('Geolocation not available');
        }
      }
    });
  }

  // Calculate distance
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
}
