import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute } from '@angular/router';
import { DataService } from './core/data.service';

@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  title = 'rc-whitelabel-app';
  p: any;

  constructor(
    private api: ApiService,
    public config: AppConfig,
    private activatedRoute: ActivatedRoute,
    private data: DataService
  ) {
  }

  ngOnInit(): void {
    // Grab Query parameters
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (!!params.code) { this.config.channelAccessCode = params.code; }
      if (!!params.key) {this.config.channelAPIKey = params.key; }
      if (!!params.lang) { this.config.language = params.lang; }
      if (!!params.t) { this.config.testMode = params.t; }
      if (!!params.d) { this.config.maxDistance = params.d; }
    });
    // Delay setting channel as activatedRoute
    // emits first value before component is ready
    // otherwise it init twice
    setTimeout(() => {
      this.data.setChannelInfo();
    }, 100);
  }
}
