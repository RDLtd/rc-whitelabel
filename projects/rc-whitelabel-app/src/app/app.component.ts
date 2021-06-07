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

  constructor(
    private api: ApiService,
    public config: AppConfig,
    private activatedRoute: ActivatedRoute,
    private data: DataService,
    private route: Router) { }

  ngOnInit(): void {
    // Wait for router event to fire before
    // checking for url params
    this.route.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(() => {
        this.activatedRoute.queryParamMap
          .subscribe((data: any) => {
            const params = data.params;
            if (Object.keys(params).length) {
              console.log('URL PARAMS:', params);
              // Override default language
              if (!!params.lang) { this.config.language = params.lang; }
              // Trigger testmode
              if (!!params.t) { this.config.testMode = params.t; }
              // Override the user distance ot
              // range in which to offer a 'near me' search option
              if (!!params.d) { this.config.maxDistance = params.d; }
            }
            this.data.loadTranslations(
              this.config.channel.accessCode,
              this.config.channel.apiKey,
              this.config.language)
              .then((obj: any) => {
                this.config.setLanguage(obj);
              })
              .catch((error) => {
                console.log('loadTranslations', error);
              });
          });
      });
  }
}
