import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  @Input() direction = '';

  constructor() {
  }

  ngOnInit(): void {
  }

}

