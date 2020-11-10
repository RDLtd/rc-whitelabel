import { environment } from '../environments/environment';

export class AppConfig {

  // get the API base url from the environment...
  public readonly apiUrl = environment.API_URL;

  // These read from URL parameters
  public channelAccessCode = '';
  public channelAPIKey = '';
  public language = '';
  public testing = false;

  // These read from the database
  public channelLogo = '';
  public channelBackgroundColor = '';
  public channelName = '';
  public channelLat = 0;
  public channelLng = 0;
  public channelLanguage = '';
  public  i18n = {
    Loading: '',
    Loading_data: '',
    Search_by_name_or_location: '',
    No_matching_search_results: '',
    Recently_viewed: '',
    Nearest_to: '',
    My_current_location: '',
    Cuisines: '',
    Sort_filter: '',
    Clear_filters: '',
    Filter_by_cuisine: '',
    Filter_by_feature: '',
    Filtered_by: '',
    Sort_by_location: '',
    My_location: '',
    Close: '',
    Empowered_by: '',
    Company: '',
    Search: '',
    Loader: '',
    You_are_new: ''
  };

  setLanguage( lan: any): void {
    this.i18n = {
      Loading: lan.channel_language_Loading,
      Loading_data: lan.channel_language_Loading_data,
      Search_by_name_or_location: lan.channel_language_Search_by_name_or_location,
      No_matching_search_results: lan.channel_language_No_matching_search_results,
      Recently_viewed: lan.channel_language_Recently_viewed,
      Nearest_to: lan.channel_language_Nearest_to,
      My_current_location: lan.channel_language_My_current_location,
      Cuisines: lan.channel_language_Cuisines,
      Sort_filter: lan.channel_language_Sort_filter,
      Clear_filters: lan.channel_language_Clear_filters,
      Filter_by_cuisine: lan.channel_language_Filter_by_cuisine,
      Filter_by_feature: lan.channel_language_Filter_by_feature,
      Filtered_by: lan.channel_language_Filtered_by,
      Sort_by_location: lan.channel_language_Sort_by_location,
      My_location: lan.channel_language_My_location,
      Close: lan.channel_language_Close,
      Empowered_by: lan.channel_language_Empowered_by,
      Company: lan.channel_language_Company,
      Search: lan.channel_language_Search,
      Loader: lan.channel_language_Loader,
      You_are_new: lan.channel_language_You_are_new
    };
  }
  setChannel( data: any ): void {
    this.channelLogo = data.channel_info.logo;
    this.channelBackgroundColor = data.channel_info.background_color;
    // Channel data - these could all be read from the database
    this.channelName = data.channel_info.name;
    this.channelLat = data.channel_info.latitude;
    this.channelLng = data.channel_info.longitude;
    this.channelLanguage = data.channel_info.language;
    if (!this.language) {
      this.language = this.channelLanguage;
    }
  }
}
