import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { GoogleMap, MapAnchorPoint, MapDirectionsService, MapInfoWindow, MapMarker} from '@angular/google-maps';
import { RestaurantsSearchService} from './restaurants-search.service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppConfig } from '../../app.config';
import { LocationService, UserGeoLocation} from '../../core/location.service';
import { ActivatedRoute, ParamMap} from '@angular/router';
import {fadeInSlideUp, fadeInStagger} from '../../shared/animations';

@Component({
  selector: 'rd-restaurants-map',
  templateUrl: './restaurants-map.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})

export class RestaurantsMapComponent implements OnInit {

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @ViewChild(MapMarker, { static: false }) mapMarker!: MapMarker;
  @ViewChildren('mapMarker') components!: QueryList<MapMarker>;

  mapApiLoaded: Observable<boolean>;

  mapOptions: google.maps.MapOptions = {
    scrollwheel: false,
    streetViewControl: false,
    center: null,
    zoom: 14,
    mapId: 'f547725f57ef2ea8',
    mapTypeControl: false
  };

  // icon!: google.maps.Icon;
  svgMarker: any;
  markers!: any[];
  infoWindowContent = {
    name: null,
    cuisine: null,
    spw: null
  };
  bounds!: google.maps.LatLngBounds;
  center?: google.maps.LatLngLiteral;
  display?: google.maps.LatLngLiteral;
  zoom = 12;
  lastZoom?: number;
  userPosition?: UserGeoLocation;

  restaurants: any[] = [];
  restaurants$!: Observable<any[]>;
  resultsLoaded$: Observable<boolean>;
  selected?: any;
  geoTarget!: string[];
  filterBy?: string | null;
  batchTotal = 6;
  currentOffset = 0;
  totalResults?: number;
  mapMarkerArr: MapMarker[] = [];

  constructor(
    private config: AppConfig,
    private results: RestaurantsSearchService,
    private restService: RestaurantsSearchService,
    private http: HttpClient,
    private location: LocationService,
    private route: ActivatedRoute
  ) {

    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.restaurants$ = this.restService.restaurants;

    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );
    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.geoTarget = params.get('geo')?.split(',') ?? [];
      this.filterBy = params.get('filter');
      this.center = { lat: this.geoTarget[0] as unknown as number, lng: this.geoTarget[1] as unknown as number}
      this.loadRestaurants();
    });

    this.mapApiLoaded = http.jsonp(
      `https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`,
      'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          console.log('Map Api Loaded');
          this.initMap();
          this.restService.restaurants.subscribe((data: any) => {
            this.restaurants = data;
            // console.log(data);
            if (data.length) {
              this.addMapMarkers();
            }
          });
        })
      );
  }

  ngOnInit(): void {
    setTimeout(() => {
      console.log(this.components.toArray());
    }, 1000)

  }

  loadRestaurants(): void {
    this.restService.loadRestaurantBatch({
      lat: this.geoTarget[0],
      lng: this.geoTarget[1],
      offset: this.currentOffset,
      limit: this.batchTotal
    });
  }

  getTotal(): number {
    return this.restService.totalRestaurants;
  }

  nextBatch(): void {
    this.currentOffset += this.batchTotal;
    this.loadRestaurants();
  }

  prevBatch(): void {
    this.currentOffset -= this.batchTotal;
    if (this.currentOffset < 0) {
      this.currentOffset = 0;
      return;
    }
    this.loadRestaurants();
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
    console.log(`Add ${this.restaurants.length} markers`);
    const totalRestaurants = this.restaurants.length;
    let i = 0;
    let r;
    let marker;
    this.markers = [];

    for (i; i < totalRestaurants; i++) {
      r = this.restaurants[i];
      // Skip the loop if no valid latitude
      if (!r.restaurant_lat || r.restaurant_lat === -999) {
        console.log(`${i} Null record`);
        continue;
      }

      marker = {
        //map: this.map,
        position: {
          lat: r.restaurant_lat as number,
          lng: r.restaurant_lng as number
        },
        options: {
          icon: this.svgMarker,
          label: {
            text: `${i}`,
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'normal',
          }
        },
        title: r.restaurant_name
      };
      // Bound map


      this.bounds.extend({
        lat: r.restaurant_lat as number,
        lng: r.restaurant_lng as number
      });
      this.markers.push(marker);
    }
    console.log('A', this.markers);

    setTimeout(() => {
      this?.map.panTo(this.markers[0].position);
      //this?.map.fitBounds(this.bounds, 100);
    }, 0);
    this.lastZoom = this.zoom;
  }

  markerClick(event: google.maps.MapMouseEvent, index: number, m: MapMarker): void {
    console.log(m);
    // @ts-ignore
    this.map.panTo(m.getPosition());
    // @ts-ignore
    this.openInfoWindow(m, this.restaurants[index]);
  }

  listClick(mm: MapMarker, index: number): void {

    this.infoWindow.close();
    const marker = this.markers[index];
    const restaurant = this.restaurants[index];
    this.selected = restaurant;
    this.map.panTo(marker.position);

    console.log(this.components.toArray()[index]);

    // @ts-ignore
    this.openInfoWindow(this.components.toArray()[0], restaurant);
  }

  openInfoWindow(m: MapMarker, restaurant: any): void {
    console.log('openInfoWindow', m);

    this.infoWindowContent = {
      name: restaurant.restaurant_name,
      cuisine: restaurant.restaurant_cuisine_1,
      spw: restaurant.restaurant_spw_url
    };
    this.infoWindow.open(m);
  }

}
