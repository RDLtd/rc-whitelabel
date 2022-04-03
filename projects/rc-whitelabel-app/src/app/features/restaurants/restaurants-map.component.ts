import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ResultsService } from './results.service';
import { Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rd-restaurants-map',
  templateUrl: './restaurants-map.component.html'
})
export class RestaurantsMapComponent {

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  mapApiLoaded: Observable<boolean>;
  mapOptions!: google.maps.MapOptions;
  // icon!: google.maps.Icon;
  svgMarker: any;
  markers: any[] = [];
  infoContent = '';
  bounds: any;
  center: google.maps.LatLngLiteral = { lat: 50, lng: -1 };
  display?: google.maps.LatLngLiteral;


  restaurants: any;
  rest$?: Observable<any>;

  constructor(
    private config: AppConfig,
    private results: ResultsService,
    private http: HttpClient
  ) {

    // forkJoin(
    //   this.results.getRestaurants(),
    //   http.jsonp(
    //     `https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`,
    //     'callback')
    // ).subscribe(res => {
    //   console.log('fork', res);
    // }, err => {
    //   console.log('error', err);
    // });

    this.results.getRestaurants().subscribe(res => {
      this.restaurants = res;
      this.rest$ = of(res);
      this.addMapMarkers();
      // console.log(res);
    });

    this.mapApiLoaded = http.jsonp(
      `https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`,
      'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          console.log('Sequence complete');
          this.initMap();
        })
      );
  }

  initMap(): void {
    this.mapOptions = {
      scrollwheel: false,
      streetViewControl: false,
      center: {
        lat: 51.34,
        lng: -0.17,
      },
      zoom: 14,
      mapId: 'f547725f57ef2ea8',
      mapTypeControl: false,
    } as google.maps.MapOptions;
    // this.icon = {
    //   url: '/assets/images/map-icon.svg',
    //   scaledSize: new google.maps.Size(36, 36)
    // };
    this.bounds = new google.maps.LatLngBounds();
    this.svgMarker = {
      path:
        'M12 8.34c-.98 0-1.9.38-2.59 1.07-.69.69-1.07 1.61-1.07 2.59s.38 1.9 1.07 2.59c.69.69 1.61 1.07 2.59 1.07s1.9-.38 2.59-1.07c.69-.69 1.07-1.61 1.07-2.59s-.38-1.9-1.07-2.59A3.638 3.638 0 0 0 12 8.34Z' +
        'M12 5.39c-1.77 0-3.43.69-4.67 1.94C6.08 8.58 5.39 10.24 5.39 12s.69 3.43 1.94 4.67c1.25 1.25 2.91 1.94 4.67 1.94s3.43-.69 4.67-1.94 1.94-2.91 1.94-4.67-.69-3.43-1.94-4.67S13.76 5.39 12 5.39Zm0 11.77a5.16 5.16 0 1 1 0-10.32 5.16 5.16 0 0 1 0 10.32Z' +
        'M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.69 3.97 10.46 9.29 11.69l2.71 4.7 2.71-4.7C20.03 22.46 24 17.7 24 12Zm-12 8.11c-4.48 0-8.11-3.63-8.11-8.11S7.52 3.89 12 3.89s8.11 3.63 8.11 8.11-3.63 8.11-8.11 8.11Z',
      fillColor: '#ff5720',
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: 0,
      scale: 1,
      anchor: new google.maps.Point(0, 30),
    };
  }

  addMapMarkers(): void {
    let i = this.restaurants.length;
    let r;
    let marker;
    console.log(i);
    while (i--) {
      r = this.restaurants[i];
      // Skip the loop if no valid latitude
      if (!r.restaurant_lat || Number(r.restaurant_lat) === -999) {
        console.log(`${i} Null record`);
        continue;
      }
      marker = {
        position: {
          lat: Number(r.restaurant_lat),
          lng: Number(r.restaurant_lng)
        },
        title: r.restaurant_name,
        options: {
          // animation: google.maps.Animation.DROP,
          icon: this.svgMarker,
        },
        info:
          `<h3>${r.restaurant_name}</h3>` +
          `<div>${r.restaurant_cuisine_1}</div>` +
          `<a href="${r.restaurant_spw_url}" target="_blank">${!!r.restaurant_spw_url ? 'SEE FULL DETAILS' : ''}</a>`
      };
      // Bound map
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    }
    this.map?.fitBounds(this.bounds);
  }

  moveMap(event: google.maps.MapMouseEvent): void {
    // @ts-ignore
    this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent): void {
    // @ts-ignore
    this.display = event.latLng.toJSON();
  }

  openInfo(marker: MapMarker, content: string): void {
    // console.log(marker);
    this.infoContent = content;
    this.infoWindow.open(marker);
  }

}
