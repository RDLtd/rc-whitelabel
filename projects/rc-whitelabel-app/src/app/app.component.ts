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
      this.config.channelAccessCode = params.code || 'FR0100';
      this.config.channelAPIKey = params.key || 'Hy56eD9h@*hhbqijsG$D19Bsshy$)kH2';
      this.config.language = params.lang;
      this.config.testMode = params.testing;
      console.log(params.code, params.key);
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
