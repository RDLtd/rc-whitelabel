import { Component, OnInit } from '@angular/core';
import { AppConfig } from './app.config';
import { ApiService } from './core/api.service';

@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  title = 'rc-whitelabel-app';

  constructor(
    private api: ApiService,
    public config: AppConfig,
  ) { }

  ngOnInit(): void {

    // get these from the parameters in the URL
    this.config.channelAccessCode = 'EN0100';
    this.config.channelAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)ss3';
    this.config.language = 'de'; // optional, if not present use the channelLanguage
    this.config.testing = true;

    this.api.getChannelInfo(this.config.channelAccessCode, this.config.channelAPIKey).toPromise()
      .then((data: any) => {

        this.config.channelLogo = data.channel_info.logo;
        this.config.channelBackgroundColor = data.channel_info.background_color;
        // Channel data - these could all be read from the database
        this.config.channelName = data.channel_info.name;
        this.config.channelLat = data.channel_info.latitude;
        this.config.channelLng = data.channel_info.longitude;
        this.config.channelLanguage = data.channel_info.language;

        if (!this.config.language) {
          this.config.language = this.config.channelLanguage;
        }

        this.api.getChannelLanguage(this.config.channelAccessCode, this.config.channelAPIKey, this.config.language).toPromise()
          .then((language: any) => {
            //
            // this.config.i18n.Loading = language.language[0].channel_language_Loading;
            // this.config.i18n.Loading_data = language.language[0].channel_language_Loading_data;
            // this.config.i18n.Search_by_name_or_location = language.language[0].channel_language_Search_by_name_or_location;
            // this.config.i18n.No_matching_search_results = language.language[0].channel_language_No_matching_search_results;
            // this.config.i18n.Recently_viewed = language.language[0].channel_language_Recently_viewed;
            // this.config.i18n.Nearest_to = language.language[0].channel_language_Nearest_to;
            // this.config.i18n.My_current_location = language.language[0].channel_language_My_current_location;
            // this.config.i18n.Cuisines = language.language[0].channel_language_Cuisines;
            // this.config.i18n.Sort_filter = language.language[0].channel_language_Sort_filter;
            // this.config.i18n.Clear_filters = language.language[0].channel_language_Clear_filters;
            // this.config.i18n.Filter_by_cuisine = language.language[0].channel_language_Filter_by_cuisine;
            // this.config.i18n.Filter_by_feature = language.language[0].channel_language_Filter_by_feature;
            // this.config.i18n.Filtered_by = language.language[0].channel_language_Filtered_by;
            // this.config.i18n.Sort_by_location = language.language[0].channel_language_Sort_by_location;
            // this.config.i18n.My_location = language.language[0].channel_language_My_location;
            // this.config.i18n.Close = language.language[0].channel_language_Close;
            // this.config.i18n.Empowered_by = language.language[0].channel_language_Empowered_by;
            // this.config.i18n.Company = language.language[0].channel_language_Company;
            // this.config.i18n.Search = language.language[0].channel_language_Search;
            // this.config.i18n.Loader = language.language[0].channel_language_Loader;
            // this.config.i18n.You_are_new = language.language[0].channel_language_You_are_new;

            // tslint:disable-next-line:forin
            for (const i18 in this.config.i18n) {
              // @ts-ignore
              this.config.i18n[i18] = language.language[0]['channel_language_' + i18];
            }

          })
          .catch((error: any) => console.log('Unable to read Language information!', error)
          );

      })
      .catch((error: any) => console.log('Unable to read Channel information!', error)
      );
  }

}
