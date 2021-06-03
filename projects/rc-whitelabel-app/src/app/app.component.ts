import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DataService } from './core/data.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  location: Location | undefined;
  channelData: any | undefined;
  inSession = false;
  title = 'rc-whitelabel-app';
  p: any;

  constructor(
    private api: ApiService,
    public config: AppConfig,
    private activatedRoute: ActivatedRoute,
    private data: DataService,
    private route: Router) {

    this.location = window.location;

  }

  ngOnInit(): void {
    // Wait for router event to fire before
    // checking params
    this.route.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(() => {
        this.activatedRoute.queryParamMap
          .subscribe((data: any) => {
            const params = data.params;
            // Are there any query params?
            if (Object.keys(params).length) {
              console.log('URL PARAMS:', params);
              // Override default language
              if (!!params.lang) { this.config.language = params.lang; }
              // Trigger testmode
              if (!!params.t) { this.config.testMode = params.t; }
              // Override the user distance ot
              // range in which to offer a 'near me' search option
              if (!!params.d) { this.config.maxDistance = params.d; }
            } else {
              console.log('No URL params supplied!');
            }
            // If it's a new session
            if (!this.inSession) {
              this.data.loadChannelConfig('directory.restaurantcollective.org.uk')
                .then((res: any) => {
                  this.channelData = res.channel_info;
                  console.log(this.channelData);
                  this.config.setChannelConfig(this.channelData);
                  this.data.loadTranslations(
                    this.channelData.access_code,
                    this.channelData.api_key,
                    this.config.language || this.channelData.language)
                    .then((obj: any) => {
                      this.config.setLanguage(obj);
                    });
                });
              this.inSession = true;
            } else {
              console.log('In session!!!');
            }
          });
    });
  }
}
