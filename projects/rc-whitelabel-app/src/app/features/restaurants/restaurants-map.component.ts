import {Component, OnInit, ViewChild} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ResultsService } from './results.service';
import { Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppConfig } from '../../app.config';
import {LocationService, UserPosition} from '../../core/location.service';

@Component({
  selector: 'rd-restaurants-map',
  templateUrl: './restaurants-map.component.html'
})
export class RestaurantsMapComponent implements OnInit {

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
  userPosition?: UserPosition;


  restaurants: any;
  rest$?: Observable<any>;

  constructor(
    private config: AppConfig,
    private results: ResultsService,
    private http: HttpClient,
    private location: LocationService
  ) {

    // Observe user position
    this.location.userLocationObs.subscribe((userPos) => {
      console.log(userPos);
      this.userPosition = userPos;
    });

    this.mapApiLoaded = http.jsonp(
      `https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`,
      'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          console.log('Map Api Loaded');
          this.loadRestaurants();
          this.initMap();
        })
      );
  }

  ngOnInit(): void {}

  loadRestaurants(): void {
    this.results.getRestaurants().subscribe(res => {
      this.restaurants = res;
      this.rest$ = of(res);
      this.addMapMarkers();
    });
  }

  initMap(): void {
    this.mapOptions = {
      scrollwheel: false,
      streetViewControl: false,
      center: {
        lat: this.userPosition?.lat,
        lng: this.userPosition?.lng,
      },
      zoom: 14,
      mapId: 'f547725f57ef2ea8',
      mapTypeControl: false,
    } as google.maps.MapOptions;
    this.bounds = new google.maps.LatLngBounds();
    this.svgMarker = {
      path:
        'M36,17.65c.15,8.15-5.11,15.08-12.42,17.47-1.03,.33-1.88,1.06-2.42,1.99l-3.16,5.48-3.16-5.48c-.54-.94-1.41-1.66-2.45-2C5.2,32.75,0,25.98,0,18,0,7.82,8.44-.38,18.71,.01c9.39,.36,17.11,8.24,17.29,17.64Z',
      fillColor: '#ff5720',
      fillOpacity: .9,
      strokeWeight: 1,
      strokeColor: '#bb3613',
      rotation: 0,
      scale: 1,
      anchor: new google.maps.Point(18, 40),
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
          icon: this.svgMarker // '/assets/images/map-icon.png'
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
