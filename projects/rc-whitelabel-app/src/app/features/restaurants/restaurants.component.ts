import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  showFilterOptions = false;
  filtersOn = false;

  constructor(
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.showFilterBtn();
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
