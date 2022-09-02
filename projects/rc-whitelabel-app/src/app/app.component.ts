import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
    private api: ApiService,
    public config: AppConfig,
    private activatedRoute: ActivatedRoute,
    private meta: Meta,
    private data: DataService,
    private router: Router) { }

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
        this.updateMetaData();
      });
  }

// <meta property="og:title" content="Restaurant Collective">
//   <meta property="og:description" content="Restaurant Collective brings together independent restaurateurs to give members a loud collective voice, and benefit from a wide range of offers and support.">
//   <meta property="og:image" content="/assets/images/safe_image.jpeg">
//   <meta property="og:image:alt" content="Image of Restaurant Collective">
//   <meta property="og:locale" content="en_GB">
//   <meta property="og:type" content="website">
//   <meta property="og:url" content="https://directory.restauranatcollective.org.uk/">
//   <meta name="twitter:card" content="summary_large_image">
//   <meta name="twitter:image" content="/assets/images/safe_image.jpeg">

  updateMetaData(): void {
    this.meta.updateTag({
      property: 'og:title',
      content: `${this.config.channel.name} Restaurant Listing`
    });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://res.cloudinary.com/rdl/image/upload/v1662038884/directory_assets/camc/og-image.jpg'
    });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: 'Family camping'
    });
    this.meta.updateTag({
      property: 'og:url',
      content: 'https://review.camc.restauranatcollective.net/'
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://res.cloudinary.com/rdl/image/upload/v1662038884/directory_assets/camc/og-image.jpg/'
    });
  }
}  
