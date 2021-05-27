import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'rd-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  constructor(public config: AppConfig) { }

  ngOnInit(): void {
  }

}
