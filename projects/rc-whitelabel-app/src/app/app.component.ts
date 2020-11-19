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
  title = 'rc-whitelabel-app';
  p: any;

  constructor(
    private api: ApiService,
    public config: AppConfig,
    private activatedRoute: ActivatedRoute,
    private data: DataService,
    private route: Router
  ) {
  }

  ngOnInit(): void {
    // Wait for router event
    this.route.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(event => {
        console.log(event.id, event.url);
        this.activatedRoute.queryParamMap.subscribe((d: any) => {
            const p = d.params;
            if (Object.keys(p).length) {
              if (!!p.code) {
                this.config.channelAccessCode = p.code;
              }
              if (!!p.key) {
                this.config.channelAPIKey = p.key;
              }
              if (!!p.lang) {
                this.config.language = p.lang;
              }
              if (!!p.t) {
                this.config.testMode = p.t;
              }
              if (!!p.d) {
                this.config.maxDistance = p.d;
              }
              this.data.setChannelInfo();
            } else
              if (window.location.hostname === 'localhost' || window.location.hostname === 'search') {
              this.data.setChannelInfo();
            }
          });
        });
    }
}
