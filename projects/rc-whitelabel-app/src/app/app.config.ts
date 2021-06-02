import { environment } from '../environments/environment';

export class AppConfig {

  // get the API base url from the environment...
  public readonly apiUrl = environment.API_URL;
  public testMode = environment.testMode;
  public defaultApiKey = 'Hy56eD9h@*hhbqijsG$D19Bsshy$)jjj';

  // These read from URL parameters
  public channelAccessCode = 'RC0101';
  public channelAPIKey = this.defaultApiKey;
  public isDefaultChannel = false;
  public language = localStorage.getItem('rd_language') || 'en';
  public channelLoaded = false;
  public maxDistance = 25;
  public resultsBatchTotal = 8;

  // Default branding
  public brand = {
    name: '',
    logoUrl: 'assets/images/rc-logo-final.svg',
    primaryBgdColor: '#00a69b',
    primaryFgdColor: '#fff',
    secondaryColor: '#ff5720',
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
        // remove prefix 'channel_language_' (17 chars)
        // and just leave string label
        this.i18n[objKey.substr(17)] = obj[objKey];
      }
    }
  }
  setChannel( data: any ): boolean {
    // console.log('Set Channel', data);
    this.channelLat = data.latitude;
    this.channelLng = data.longitude;
    this.channelName = data.name;
    this.channelLanguage = data.language;
    // Branding
    this.brand.logoUrl = data.logo;
    this.brand.primaryBgdColor = data.primaryBgColor;
    this.brand.primaryFgdColor = data.primaryFgColor;
    this.brand.secondaryColor = data.secondaryColor;
    this.brand.name = data.name;
    this.isDefaultChannel = (this.brand.name === 'Member Restaurant Directory');
    console.log('Default Channel', this.brand);

    if (!this.language) {
      this.language = this.channelLanguage;
    }
    this.channelLoaded = true;
    return true;
  }
}
