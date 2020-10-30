import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';

@Component({
  selector: 'rd-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit {

  showFilterOptions = false;

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    setTimeout( () => {
      this.showFilterOptions = true;
    }, 1500);
  }

  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  openSPW(url: string): void {
    console.log('open:', url);
    window.open(url, '_blank');
  }

}
