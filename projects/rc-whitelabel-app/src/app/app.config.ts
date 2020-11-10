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

  // VISIT BRIGHTON

  // // Channel specification
  // public readonly channelAccessCode = 'EN0100';
  // public readonly channelAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)ss3';
  // // Channel Design
  // public readonly channelLogo = 'logo-partner-vb@3x.png';
  // public readonly channelBackgroundColor = '';
  // // Channel data - these could all be read from the database
  // public readonly channelName = 'Visit Brighton';
  // public readonly channelLat = 50.8226; // these are the 'central' coordinates of the channel
  // public readonly channelLng = -0.1365; // in testing they will be used as if this was the location of the user
  // temporary setup for i18n
  // public readonly i18n = {
  //   Loading: 'LOADING',
  //   Loading_data: 'LOADING DATA',
  //   Search_by_name_or_location: 'Search by name, location or cuisine',
  //   No_matching_search_results: 'No matching search results, try one of the options below',
  //   Recently_viewed: 'Recently viewed',
  //   Nearest_to: 'Nearest to',
  //   My_current_location: 'My current location',
  //   Cuisines: 'Cuisines',
  //   Sort_filter: 'Sort/Filter',
  //   Clear_filters: 'Clear filters',
  //   Filter_by_cuisine: 'Filter by Cuisine',
  //   Filter_by_feature: 'Filter by Feature',
  //   Filtered_by: 'Filtered by',
  //   Sort_by_location: 'Sort by Location',
  //   My_location: 'Nearest my current location',
  //   Close: 'CLOSE',
  //   Empowered_by: 'Empowered by',
  //   Company: 'RESTAURANT COLLECTIVE',
  //   Search: 'SEARCH',
  //   Loader: 'LOADER',
  //   You_are_new: 'You're new, so nothing here yet!'
  // };

  // // NICE SHOPPING
  //
  // Channel specification
  // public readonly channelAccessCode = 'FR0100';
  // public readonly channelAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)kH2';
  // // Channel Design
  // public readonly channelLogo = 'logo-partner@3x.png';
  // public readonly channelBackgroundColor = '';
  // // Channel data - these could all be read from the database
  // public readonly channelName = 'Nice Shopping';
  // public readonly channelLat = 43.695; // these are the 'central' coordinates of the channel
  // public readonly channelLng = 7.266; // in testing they will be used as if this was the location of the user
  // // temporary setup for i18n
  // public readonly i18n = {
  //   Loading: 'CHARGEMENT',
  //   Loading_data: 'CHARGEMENT DES DONNÉES',
  //   Search_by_name_or_location: 'Rechercher par nom, lieu, ou cuisine',
  //   No_matching_search_results: 'Aucun résultat de recherche correspondant, essayez l\'une des options ci-dessous',
  //   Recently_viewed: 'Vu récemment',
  //   Nearest_to: 'Le plus proche de',
  //   My_current_location: 'Ma position actuelle',
  //   Cuisines: 'Cuisines',
  //   Sort_filter: 'Trier/Filtrer',
  //   Clear_filters: 'Effacer les filtres',
  //   Filter_by_cuisine: 'Filtrer par cuisine',
  //   Filter_by_feature: 'Filtrer par fonctionnalité',
  //   Filtered_by: 'Filtrer par',
  //   Sort_by_location: 'Trier par emplacement',
  //   My_location: 'Nearest my current location',
  //   Close: 'FERMER',
  //   Empowered_by: 'Renforcé par',
  //   Company: 'RESTAURATEURS INDEPENDANTS',
  //   Search: 'CHERCHER',
  //   Loader: 'CHARGEUR'
  //   You_are_new: 'Vous êtes nouveau, donc rien ici encore!'
  // };
}
