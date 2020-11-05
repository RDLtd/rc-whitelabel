import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LocalStorageService } from '../../local-storage.service';
import { DataService, Restaurant } from '../../data.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  // Confic
  apiAccessCode = 'EN0100';
  apiKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)ss3';

  showFilterOptions = false;
  filtersOn = false;
  restaurants: any[] = [];
  restaurantsLoaded = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    public data: DataService
  ) { }

  ngOnInit(): void {
    // Check for sort/filtering
    // this.route.paramMap.subscribe((params: ParamMap) => {
    //   console.log(params);
    // });
    this.loadRestaurants().then((res: any) => {
      console.log('Restaurants loaded');
    });
    this.showFilterBtn();
  }

  public async loadRestaurants(): Promise<any> {
    if (!this.data.getRestaurants().length) {
      const promise = await this.api.getRestaurants(this.apiAccessCode, this.apiKey, 'not used',
        40, 7)
        .toPromise()
        .then((res: any) => {
          this.restaurants = res.restaurants;
          this.data.setRestaurants(res.restaurants);
          console.log('From API', res.restaurants);
        });
    } else {
      this.restaurants = this.data.getRestaurants();
      console.log('Local', this.restaurants);
    }
  }

  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      width: '90%',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.filtersOn = true;
        this.router.navigate(result);
      }

    });
  }

  showFilterBtn(): void {
    setTimeout( () => {
      this.showFilterOptions = true;
    }, 500);
  }

  clearFilters(): void {
    this.router.navigate(['/restaurants', 'all']);
    this.filtersOn = false;
    this.showFilterOptions = false;
    this.showFilterBtn();
  }

  openSPW(url: string): void {
    console.log('open:', url);
    window.open(url, '_self');
  }

}
