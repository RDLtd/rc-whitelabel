import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import { RestaurantsService} from './restaurants.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppConfig } from '../../app.config';
import { LocationService, UserGeoLocation} from '../../core/location.service';
import { ActivatedRoute, ParamMap} from '@angular/router';
import {fadeInSlideUp, fadeInStagger} from '../../shared/animations';

@Component({
  selector: 'rd-restaurants-map',
  templateUrl: './map-view.component.html',
  animations: [fadeInSlideUp, fadeInStagger]
})

export class MapViewComponent implements OnInit {

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @ViewChild(MapMarker, { static: false }) mapMarker!: MapMarker;
  @ViewChildren('mapMarker') mapMarkerComponents!: QueryList<MapMarker>;

  mapApiSubject = new BehaviorSubject<boolean>(false);
  mapApiLoaded$ = this.mapApiSubject.asObservable();
  mapOptions: google.maps.MapOptions = {
    scrollwheel: false,
    streetViewControl: false,
    center: null,
    zoom: 14,
    mapId: 'f547725f57ef2ea8',
    mapTypeControl: false
  };
  svgMarker: any;
  svgMarkerActive: any;
  markers!: any[];
  selectedMarker?: MapMarker;
  mapMarkerArr: MapMarker[] = [];
  infoWindowContent = {
    name: null,
    cuisine: null,
    spw: null
  };
  bounds!: google.maps.LatLngBounds;
  center?: google.maps.LatLngLiteral = { lat: -34.397, lng: 150.644 };
  display?: google.maps.LatLngLiteral;
  zoom = 12;
  lastZoom?: number;
  userPosition?: UserGeoLocation;

  // Restaurants
  restaurants: any[] = [];
  restaurants$!: Observable<any[]>;
  resultsLoaded$: Observable<boolean>;
  geoTarget!: string[];
  filterBy?: string | null;
  batchTotal = 8;
  currentOffset = 0;
  totalResults?: number;


  constructor(
    private config: AppConfig,
    private results: RestaurantsService,
    private restService: RestaurantsService,
    private http: HttpClient,
    private location: LocationService,
    private route: ActivatedRoute
  ) {

    // Results received
    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.restaurants$ = this.restService.restaurants;

    // observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );

    // Check url params
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.geoTarget = params.get('geo')?.split(',') ?? [];
      this.filterBy = params.get('filter');
      this.center = { lat: Number(this.geoTarget[0]), lng: Number(this.geoTarget[1])}
      console.log('Got geo');
      this.loadRestaurants();
    });

    // Check to see if we have the Google maps api script in the cache
    // Don't load it again!
    if (window.hasOwnProperty('google')) {
      console.log('Google maps api already available');
      this.initMap();
      this.mapApiSubject.next(true);
    } else {
    // otherwise, we need to load it
      console.log('Load Google maps api');
      this.mapApiLoaded$ = http.jsonp(
        `https://maps.googleapis.com/maps/api/js?key=${this.config.geoApiKey}`,
        'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
          finalize(() => {
            this.initMap();
          })
        );
    }
  }

  ngOnInit(): void {}

  loadRestaurants(): void {
    this.restService.loadRestaurantBatch({
      lat: this.geoTarget[0],
      lng: this.geoTarget[1],
      offset: this.currentOffset,
      limit: this.batchTotal
    });
  }

  // Text for list nav
  getBatchNavSummary(): string {
    let lastBatchItem = this.currentOffset + this.batchTotal;
    const totalResults = this.restService.totalRestaurants;
    if (lastBatchItem > totalResults) { lastBatchItem = totalResults; }
    return `Displaying results ${ this.currentOffset + 1 } to ${ lastBatchItem } of ${ totalResults }`;
  }
  getTotalResults(): number {
    return this.restService.totalRestaurants;
  }

  // List nav
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


  // Activate Google map
  initMap(): void {
    // Set MapMarker icon as an inline svg
    this.svgMarker = {
      path:
        'M11.9858571,34.9707603 C5.00209157,32.495753 0,25.8320271 0,18 C0,8.0588745 8.0588745,0 18,0 C27.9411255,0 36,8.0588745 36,18 C36,25.8320271 30.9979084,32.495753 24.0141429,34.9707603 C24.0096032,34.980475 24.0048892,34.9902215 24,35 C20,37 18,40.6666667 18,46 C18,40.6666667 16,37 12,35 C11.9951108,34.9902215 11.9903968,34.980475 11.9858571,34.9707603 Z',
      fillColor: '#9a9a9a',
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#fff',
      rotation: 0,
      scale: 1,
      labelOrigin: { x: 17, y: 18 },
      anchor: new google.maps.Point(18, 40)
    };
    // Duplicate and edit to use as the 'active' icon
    this.svgMarkerActive = Object.assign({}, this.svgMarker);
    this.svgMarkerActive.scale = 1.5;
    this.svgMarkerActive.fillOpacity = 1;
    this.svgMarkerActive.fillColor = '#ff5720';
    // initialise the map bounds
    this.bounds = new google.maps.LatLngBounds();
    // subscribe to restaurant results
    this.restService.restaurants.subscribe((data: any) => {
      this.restaurants = data;
      // console.log(data);
      if (data.length) {
        this.addMapMarkers();
      }
    });
  }

  addMapMarkers(): void {
    const totalRestaurants = this.restaurants.length;
    let i = 0;
    let r;
    let markerComp;
    this.markers = [];
    this.bounds = new google.maps.LatLngBounds();

    for (i; i < totalRestaurants; i++) {
      r = this.restaurants[i];
      // Skip the loop if no valid latitude
      if (!r.restaurant_lat || r.restaurant_lat === -999) {
        console.log(`${i} Null record`);
        continue;
      }
      markerComp = {
        position: {
          lat: r.restaurant_lat as number,
          lng: r.restaurant_lng as number
        },
        zIndex: i + 10,
        options: {
          icon: this.svgMarker,
          label: {
            text: `${i + this.currentOffset + 1}`,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
          }
        },
        title: r.restaurant_name
      };

      // Bound map
      this.bounds.extend({
        lat: r.restaurant_lat as number,
        lng: r.restaurant_lng as number
      });
      this.markers.push(markerComp);
    }

    setTimeout(() => {
      //this?.map.panTo(this.markers[0].position);
      this?.map.fitBounds(this.bounds, 100);
    }, 0);
    this.lastZoom = this.zoom;
  }

  /**
   * When a map marker is selected
   * @param marker MapMarker component
   * @param index restaurants array reference
   */
  markerClick(marker: MapMarker, index: number): void {
    this.selectMapMarker(marker, this.restaurants[index]);
  }

  /**
   * When a list element is selected
   * @param el a reference to the list element
   * @param index restaurants array reference
   */
  listClick(el: any, index: number): void {
    // const items = document.querySelectorAll('.rd-map-list-item');
    // items.forEach(item => item.classList.remove('active'));
    // el.classList.add('active');

    // All currently displayed MapMarkers
    const mapMarkersArray = this.mapMarkerComponents.toArray();
    // Reference the Angular MapMarker component
    const mapMarkerComponent = mapMarkersArray[index];
    // Reference the corresponding restaurant data
    const restaurant = this.restaurants[index];
    // Activate the marker
    this.selectMapMarker(mapMarkerComponent, restaurant);
  }

  /**
   * Activate the map marker
   * @param marker Angular MapMarker
   * @param restaurant Restaurant data
   */
  selectMapMarker(marker: MapMarker, restaurant: any): void {
    // reset current window & marker
    this.infoWindow.close();
    this.selectedMarker?.marker?.setOptions({
      zIndex: 1,
      icon: this.svgMarker
    })
    // Apply active icon and bring to front of any stack
    this.selectedMarker = marker;
    this.selectedMarker.marker?.setOptions({
      zIndex: 100,
      icon: this.svgMarkerActive
    });
    // @ts-ignore
    this.map.panTo(marker.getPosition());
    // this.selectedMarker.marker?.setAnimation(google.maps.Animation.BOUNCE);
    const latlngbounds = new google.maps.LatLngBounds();
    // @ts-ignore
    latlngbounds.extend(marker.getPosition());
    // this.map.fitBounds(latlngbounds, 0);

    // Update content & open mapInfoWindow
    this.infoWindowContent = {
      name: restaurant.restaurant_name,
      cuisine: restaurant.restaurant_cuisine_1,
      spw: restaurant.restaurant_spw_url
    };
    this.infoWindow.open(marker);
  }
}
