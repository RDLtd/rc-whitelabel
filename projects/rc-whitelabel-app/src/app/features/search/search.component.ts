import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'rd-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {

  @ViewChild('rdSearchInput') rdSearchInput!: ElementRef;

  searchString = '';

  constructor() { }

  ngOnInit(): void {
    setTimeout( () => {
      this.rdSearchInput.nativeElement.focus();
    }, 100);
  }

  search(val: string): void {
    console.log('SEARCH', val);
  }

}
