import { environment } from '../environments/environment';
export interface Brand {
  logoPath: string;
  colorBgdPrimary: string;
  colorFgdPrimary: string;
  colorSecondary: string;
  colorAccent: string;
}
export interface Channel {
  name: string;
  domain: string;
  accessCode: string;
  apiKey: string;
  latitude: number;
  longitude: number;
  language?: string;
  brand?: Brand;
}

export class AppConfig {
  // Api
  public readonly apiUrl = environment.API_URL;
  public testMode = environment.testMode;
  // Only show 'near me' search option if
  // user is within maxDistance km range
  public maxDistance = 25;
  // Number of restaurant returned in each batch
  public resultsBatchTotal = 8;
  // Use browser settings
  public language = window.navigator.language.substr(0, 2) || 'en';
  public channel!: Channel;
  public channelLoaded = false;
  public i18n: any = {};

  // Default branding
  public brand = {
    name: '',
    logoUrl: 'assets/images/rc-logo-final.svg',
    primaryBgdColor: '#00a69b',
    primaryFgdColor: '#fff',
    secondaryColor: '#ff5720',
    accentColor: '#ade3e3'
  };

  setLanguage( obj: any): void {
    for (const objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
        // remove prefix 'channel_language_' (17 chars)
        // and just leave string label
        this.i18n[objKey.substr(17)] = obj[objKey];
      }
    }
  }

  setChannelConfig(data: any): void {
    this.channel = {
      domain: data.domain,
      name: data.name,
      accessCode: data.access_code,
      apiKey: data.api_key,
      latitude: data.latitude,
      longitude: data.longitude,
      language: data.language,
      brand: {
        logoPath: data.logo,
        colorBgdPrimary: data.primaryBgColor,
        colorFgdPrimary: data.primaryFgColor,
        colorSecondary: data.secondaryColor,
        colorAccent: data.accentColor
      }
    };
    console.log('Channel Loaded!!!');
    this.channelLoaded = true;
  }
}
