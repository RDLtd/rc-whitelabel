import {Component, OnInit, ViewChild} from '@angular/core';
import { GoogleMap, MapDirectionsService, MapInfoWindow, MapMarker } from '@angular/google-maps';
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
  center?: google.maps.LatLngLiteral;
  display?: google.maps.LatLngLiteral;
  zoom = 12;
  lastZoom?: number;
  userPosition?: UserPosition;
  options: google.maps.MapOptions = {
    scrollwheel: false,
    streetViewControl: false,
    center: {
      lat: 51.75039548959754,
      lng: -1.257546009059814
    },
    zoom: 14,
    mapId: 'f547725f57ef2ea8',
    mapTypeControl: false
  };


  restaurants: any;
  rest$?: Observable<any>;

  constructor(
    private config: AppConfig,
    private results: ResultsService,
    private http: HttpClient,
    private location: LocationService,
    private mapDirectionsService: MapDirectionsService
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
      this.rest$ = of(this.restaurants);
      this.addMapMarkers();
    });
  }

  initMap(): void {
    this.bounds = new google.maps.LatLngBounds();
    this.svgMarker = {
      path:
        'M11.9858571,34.9707603 C5.00209157,32.495753 0,25.8320271 0,18 C0,8.0588745 8.0588745,0 18,0 C27.9411255,0 36,8.0588745 36,18 C36,25.8320271 30.9979084,32.495753 24.0141429,34.9707603 C24.0096032,34.980475 24.0048892,34.9902215 24,35 C20,37 18,40.6666667 18,46 C18,40.6666667 16,37 12,35 C11.9951108,34.9902215 11.9903968,34.980475 11.9858571,34.9707603 Z',
      fillColor: '#ff5724',
      fillOpacity: .75,
      strokeWeight: 1,
      strokeColor: '#fff',
      rotation: 0,
      scale: 1,
      labelOrigin: { x: 18, y: 18 },
      anchor: new google.maps.Point(18, 40)
    };
  }

  addMapMarkers(): void {
    const totalRestaurants = this.restaurants.length;
    let i = 0;
    let r;
    let marker;
    for (i; i < totalRestaurants; i++) {
      r = this.restaurants[i];
      // Skip the loop if no valid latitude
      if (!r.restaurant_lat || Number(r.restaurant_lat) === -999) {
        console.log(`${i} Null record`);
        continue;
      }
      marker = {
        map: this.map,
        position: {
          lat: r.restaurant_lat as number,
          lng: r.restaurant_lng as number
        },
        options: {
          // animation: google.maps.Animation.DROP,
          icon: this.svgMarker,
          label: {
            text: `${i + 1}`,
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
          }
        },
        title: r.restaurant_name,
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
    this.lastZoom = this.zoom;
  }

  markerClick(event: google.maps.MapMouseEvent, index: number, m: MapMarker): void {
    this.lastZoom = this.map.getZoom();
    console.log(m.position);
    this.map.panTo(m.position);
  }

  listClick(index: number): void {
    const marker = this.markers[index];
    this.map?.fitBounds(this.bounds);
    this.map.panTo({
      lat: this.restaurants[index].restaurant_lat,
      lng: this.restaurants[index].restaurant_lng
    });
  }

  openInfo(marker: MapMarker, content: string): void {
    // console.log(marker);
    this.infoContent = content;
    this.infoWindow.open(marker);
  }



}
