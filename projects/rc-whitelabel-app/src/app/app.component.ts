import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  title = 'rc-whitelabel-app';

  constructor(
    private api: ApiService,
    public config: AppConfig,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Grab Query parameters
    this.route.queryParams.subscribe((params: any) => {
      this.config.channelAccessCode = params.code || 'EN0100';
      this.config.channelAPIKey = params.key || 'Hy56eD9h@*hhbqijsG$D19Bsshy$)ss3';
      if (!!params.lang) { this.config.language = params.lang; }
      if (!!params.t) { this.config.testMode = params.t; }
      if (!!params.d) { this.config.maxDistance = params.d; }
      console.log(this.config);
    });

    // Load config
    // Would like to move this to data service
    this.api.getChannelInfo(this.config.channelAccessCode, this.config.channelAPIKey)
      .toPromise()
      .then((data: any) => {
        this.config.setChannel(data.channel_info);
        this.api.getChannelLanguage(this.config.channelAccessCode, this.config.channelAPIKey, this.config.language)
          .toPromise()
          .then((language: any) => {
            this.config.setLanguage( language.language[0]);
          })
          .catch((error: any) => console.log('Unable to read Language information!', error)
          );
      })
      .catch((error: any) => console.log('Unable to read Channel information!', error)
      );
  }
}
