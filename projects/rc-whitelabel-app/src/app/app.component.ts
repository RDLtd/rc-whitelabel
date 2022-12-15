import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { DataService } from './core/data.service';
import { filter } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';

declare const gtag: Function;

@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  constructor(
    private   api: ApiService,
    public    config: AppConfig,
    private   activatedRoute: ActivatedRoute,
    private   meta: Meta,
    private   data: DataService,
    private   router: Router) { }

  ngOnInit(): void {

    // Wait for router event to fire before
    // checking for url params
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        gtag('config', 'G-LB1KHS83QH', { 'page_path': event.urlAfterRedirects });
        this.activatedRoute.queryParamMap
          .subscribe((data: any) => {
            const params = data.params;
            if (Object.keys(params).length) {
              // Override default language
              if (!!params.lang) { this.config.language = params.lang; }
              // Trigger testmode
              if (!!params.t) { this.config.testMode = params.t; }
              // Override the user distance ot
              // range in which to offer a 'near me' search option
              if (!!params.d) { this.config.maxUserDistance = params.d; }
            }
            this.data.loadTranslations()
              .then((obj: any) => {
                this.config.setLanguage(obj);
              })
              .catch((error) => {
                console.log('loadTranslations', error);
              });
          });
        // Update OG data etc.
        this.updateMetaData();
        //
        this.config.setBrandTheme();
      });
  }

  /**
   * Update all OpenGraph data based
   * on Channel config
   */
  updateMetaData(): void {
    console.log('Update meta tags', this.config.channel.openGraph);
    this.meta.updateTag({
      property: 'og:title',
      content: this.config.channel.openGraph.title
    });
    this.meta.updateTag({
      property: 'og:image',
      content: this.config.channel.openGraph.image
    });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: this.config.channel.openGraph.alt
    });
    this.meta.updateTag({
      property: 'og:url',
      content: this.config.channel.openGraph.url
    });
  }

}
