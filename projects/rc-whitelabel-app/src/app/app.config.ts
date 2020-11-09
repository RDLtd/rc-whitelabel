import { environment } from '../environments/environment';

export class AppConfig {

  // set up testing data if required
  public readonly testing = true;

  // get the API base url from the environment...
  public readonly apiUrl = environment.API_URL;

  // VISIT BRIGHTON

  // Channel specification
  public readonly channelAccessCode = 'EN0100';
  public readonly channelAPIKey = 'Hy56%D9h@*hhbqijsG$D19Bsshy$)ss3';
  // Channel Design
  public readonly channelLogo = 'logo-partner-vb@3x.png';
  public readonly channelBackgroundColor = '';
  // Channel data - these could all be read from the database
  public readonly channelName = 'Visit Brighton';
  public readonly channelLat = 50.8226; // these are the 'central' coordinates of the channel
  public readonly channelLng = -0.1365; // in testing they will be used as if this was the location of the user
  // temporary setup for i18n
  public readonly i18n = {
    Loading: 'LOADING',
    Search_by_name_or_location: 'Search by name, location or cuisine',
    No_matching_search_results: 'No matching search results, try one of the options below',
    Recently_viewed: 'Recently viewed',
    Nearest_to: 'Nearest to',
    My_current_location: 'My current location',
    Cuisines: 'Cuisines',
    Sort_filter: 'Sort/Filter',
    Clear_filters: 'Clear filters',
    Filter_by_cuisine: 'Filter by Cuisine',
    Filter_by_feature: 'Filter by Feature',
    Filtered_by: 'Filtered by',
    Sort_by_location: 'Sort by Location',
    My_location: 'Nearest my current location',
    Close: 'CLOSE',
    Empowered_by: 'Empowered by',
    Company: 'RESTAURANT COLLECTIVE',
    Search: 'SEARCH',
    Loader: 'LOADER'
  };

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
  //   Search_by_name_or_location: 'Rechercher par nom ou par lieu',
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
  // };
}
