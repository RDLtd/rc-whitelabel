import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'rd-filter-options-dialog',
  templateUrl: './filter-options-dialog.component.html'
})
export class FilterOptionsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {cuisines: any[], landmarks: any[]}) { }

  ngOnInit(): void { }
}
