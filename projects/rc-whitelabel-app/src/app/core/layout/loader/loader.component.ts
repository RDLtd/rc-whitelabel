import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'rd-loader',
  templateUrl: './loader.component.html'
})
export class LoaderComponent implements OnInit {

  @Input() loadText = '';

  constructor() { }

  ngOnInit(): void {
  }

}
