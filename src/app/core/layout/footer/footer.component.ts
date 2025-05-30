import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
    selector: 'rd-footer',
    templateUrl: './footer.component.html',
    standalone: false
})
export class FooterComponent implements OnInit {

  constructor(public config: AppConfig) { }

  ngOnInit(): void {
  }
}
