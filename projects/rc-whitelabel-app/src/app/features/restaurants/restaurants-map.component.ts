import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GoogleMap, MapInfoWindow} from '@angular/google-maps';
import {ResultsService} from './results.service';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError, finalize, map} from 'rxjs/operators';
import {AppConfig} from '../../app.config';

@Component({
  selector: 'rd-restaurants-map',
  templateUrl: './restaurants-map.component.html'
})
export class RestaurantsMapComponent implements OnInit, AfterViewInit {

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  mapOptions: google.maps.MapOptions;
  restaurants: any;
  rest$?: Observable<any>;
  center: google.maps.LatLngLiteral = {lat: 50, lng: -1};
  zoom = 2;
  display?: google.maps.LatLngLiteral;
  apiLoaded: Observable<boolean>;
  markers: any[] = [];
  infoContent = '';
  bounds: any;


  constructor(
    private config: AppConfig,
    private results: ResultsService,
    private http: HttpClient
  ) {
    this.mapOptions = {
      scrollwheel: false,
      center: {
        lat: 51.34,
        lng: -0.17,
      },
      zoom: 14,
      mapId: 'a2280159ceaa2285',
    } as google.maps.MapOptions;
    this.results.getRestaurants().subscribe(res => {
      this.restaurants = res;
      this.rest$ = of(this.restaurants);
      this.initMap();
      console.log(res);
    });
    this.apiLoaded = http.jsonp(`https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`, 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          console.log('Sequence complete');
          this.bounds = new google.maps.LatLngBounds();

        })
      );
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // console.log(this.map);
  }

  initMap(): void {
    let i = this.restaurants.length;
    let r;
    let marker;
    console.log(i);
    while (i--) {
      r = this.restaurants[i];
      // console.log(r);
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
        // options: { animation: google.maps.Animation.DROP },
        info:
          `<h3>${r.restaurant_name}</h3>` +
          `<div>${r.restaurant_lat},${r.restaurant_lng}</div>` +
          `<a href="${r.restaurant_spw_url}" target="_blank">${!!r.restaurant_spw_url ? 'View SPW' : ''}</a>`
      };
      // Bound map
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    }
    this.map?.fitBounds(this.bounds);
    // this.state.showProgressBar(false);
  }

  moveMap(event: google.maps.MapMouseEvent): void {
    // @ts-ignore
    this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent): void {
    // @ts-ignore
    this.display = event.latLng.toJSON();
  }

}
