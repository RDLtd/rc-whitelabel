import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AppConfig } from '../../app.config';
import {MatLegacySelectionList as MatSelectionList} from '@angular/material/legacy-list';

@Component({
  selector: 'rd-filter-options-dialog',
  templateUrl: './filter-options-dialog.component.html'
})
export class FilterOptionsDialogComponent implements AfterViewInit {

  @ViewChild('cuisineSelection') cuisineSection?: MatSelectionList;

  constructor(
    public config: AppConfig,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngAfterViewInit(): void {
    // console.log('Filter data:', this.cuisineSection);
  }
}
