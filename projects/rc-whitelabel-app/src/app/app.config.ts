import { environment } from '../environments/environment';

export class AppConfig {

  // get the API base url from the environment...
  public readonly apiUrl = environment.API_URL;

  // These read from URL parameters
  public channelAccessCode = '';
  public channelAPIKey = '';
  public language = '';
  public testing = false;
  public testVal: any;

  // These read from the database
  public channelLogo = 'assets/images/rc-logo-white-white.png';
  public channelBackgroundColor = '';

  public brand = {
    logoUrl: 'assets/images/rc-logo-white-white.png',
    primaryBgdColor: '#FF3D00',
    primaryFgdColor: '#fff',
    secondaryColor: '#f66e06',
    accentColor: '#ade3e3'
  };
  // Visit Brighton
  // public brand = {
  //   logoUrl: 'https://www.visitbrighton.com/dbimgs/logo(3).png',
  //   primaryBgdColor: '#00a8ec',
  //   primaryFgdColor: '#fff',
  //   secondaryColor: '#f66e06',
  //   accentColor: '#ade3e3'
  // };
  // Nice Shopping
  // public brand = {
  //   logoUrl: 'https://niceshopping.fr/wp-content/uploads/2019/06/logo.png',
  //   primaryBgdColor: '#3994f0',
  //   primaryFgdColor: '#fff',
  //   secondaryColor: '#f66e06',
  //   accentColor: '#ade3e3'
  // };
  public channelName = '';
  public channelLat = 0;
  public channelLng = 0;
  public channelLanguage = '';
  public i18n: any = {};

  setLanguage( obj: any): void {
    for (const objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
        // remove 'channel_language' (17 chars) and just leave string label
        this.i18n[objKey.substr(17)] = obj[objKey];
      }
    }
  }
  setChannel( data: any ): void {
    // Branding
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
