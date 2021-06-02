import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DataService } from './core/data.service';
import { filter } from 'rxjs/operators';
import { LocalStorageService } from './core/local-storage.service';

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
    private data: DataService,
    private route: Router,
    private local: LocalStorageService
  ) {
  }

  ngOnInit(): void {
    // Wait for router event to fire before
    // checking params
    this.route.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(() => {
        console.log('Route event fired');
        // Check for on-going session
        const inSession = this.local.get('rdSessionExpiry') > new Date().getTime();
        console.log('Live Session?', inSession);
        this.activatedRoute.queryParamMap
          .subscribe((data: any) => {
            const params = data.params;
            console.log('Url Params', params);
            // Are there any query params?
            if (Object.keys(params).length) {
              // Is there an APIKey?
              if (!!params.key) {
                console.log('Use API key from query param');
                this.config.channelAPIKey = params.key;
                this.config.channelAccessCode = params.code;
              } else {
                if (inSession) {
                  console.log('In session Channel data');
                  this.config.channelAPIKey = this.local.get('rdChannelApiKey');
                  this.config.channelAccessCode = this.local.get('rdChannelAccessCode');
                } else {
                  // We can abort here and show a 404
                  console.log('No valid API key in parameters and no valid session!');
                }
              }
              // Apply any additional params
              if (!!params.lang) {
                this.config.language = params.lang;
              }
              // Testmode
              if (!!params.t) {
                this.config.testMode = params.t;
              }
              // Defines the max range (from channel centre)
              // for a 'near me' option?
              if (!!params.d) {
                this.config.maxDistance = params.d;
              }
              this.data.setChannelInfo();
            }
            else {
              console.log('No query params');
              if (inSession) {
                this.config.channelAPIKey = this.local.get('rdChannelApiKey');
                this.config.channelAccessCode = this.local.get('rdChannelAccessCode');
                console.log('Load cached Channel');
                this.data.setChannelInfo();
              }
              else {
                console.log('Load RC default channel');
                this.data.setChannelInfo();
              }
            }
          });
        });
    }
}
