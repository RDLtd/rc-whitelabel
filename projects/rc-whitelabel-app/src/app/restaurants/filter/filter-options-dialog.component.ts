import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfig } from '../../app.config';
import {MatSelectionList} from '@angular/material/list';

@Component({
  selector: 'rd-filter-options-dialog',
  templateUrl: './filter-options-dialog.component.html'
})
export class FilterOptionsDialogComponent implements OnInit {

  @ViewChild('cuisineSelection') cuisineSection?: MatSelectionList;

  constructor(
    public config: AppConfig,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    console.log('Filter data:', this.data);
  }
}
