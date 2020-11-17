import { environment } from '../environments/environment';

export class AppConfig {

  // get the API base url from the environment...
  public readonly apiUrl = environment.API_URL;
  public testMode = environment.testMode;

  // These read from URL parameters
  public channelAccessCode = '';
  public channelAPIKey = '';
  public language = '';
  public configLoaded = false;
  // TODO: add to channel config
  public maxDistance = 25;

  public brand = {
    logoUrl: 'assets/images/rc-logo-white-white.png',
    primaryBgdColor: '#FF3D00',
    primaryFgdColor: '#fff',
    secondaryColor: '#f66e06',
    accentColor: '#ade3e3'
  };
  public channelName = '';
  public channelLat = 0;
  public channelLng = 0;
  public channelLanguage = 'en';
  public i18n: any = {};

  setLanguage( obj: any): void {
    for (const objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
        // remove 'channel_language' (17 chars) and just leave string label
        this.i18n[objKey.substr(17)] = obj[objKey];
      }
    }
  }
  setChannel( data: any ): boolean {
    console.log(data);

    // Info
    this.channelName = data.name;
    this.channelLat = data.latitude;
    this.channelLng = data.longitude;
    this.channelLanguage = data.language;

    // Branding
    this.brand.logoUrl = data.logo;
    this.brand.primaryBgdColor = data.primaryBgColor;
    this.brand.primaryFgdColor = data.primaryFgColor;
    this.brand.secondaryColor = data.secondaryColor;

    if (!this.language) {
      this.language = this.channelLanguage;
    }
    this.configLoaded = true;
    return true;
  }
}
