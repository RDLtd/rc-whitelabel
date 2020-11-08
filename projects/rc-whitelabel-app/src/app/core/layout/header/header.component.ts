import { Component, Input, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  @Input() direction = '';

  constructor(public config: AppConfig) {
  }

  ngOnInit(): void {
  }

}

