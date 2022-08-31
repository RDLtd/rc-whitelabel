import { environment } from '../environments/environment';
export interface Brand {
  logo: string;
  bgImage: string;
  colorBgdPrimary: string;
  colorFgdPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorCta: string;
}
export interface Brand2 {
  imgLogo: string;
  imgBgd: string;
  colHeaderBg: string;
  colHeaderFg: string;
  colFooterBg: string;
  colFooterFg: string;
  colTextAccent: string;
  colBtnCta: string;
  colOffers: string
}
export interface Channel {
  id: number;
  name: string;
  domain: string;
  type: string;
  accessCode: string;
  apiKey: string;
  latitude: number;
  longitude: number;
  language?: string;
  brand?: Brand;
  analyticsId?: string;
}

export class AppConfig {
  // Api
  public readonly apiUrl = environment.API_URL;
  public readonly geoApiKey = environment.GOOGLE_MAP_API_KEY;
  public testMode = environment.testMode;
  // Only show 'near me' search option if
  // user is within maxDistance km range
  public maxDistance = 25;
  // Number of restaurant returned in each batch
  public resultsBatchTotal = 8;
  // How many cuisines to display as quick links
  public maxTopCuisines = 10;
  // Use browser settings
  public language = window.navigator.language.substr(0, 2) || 'en';
  public channel!: Channel;
  public channelLoaded = false;
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

  setChannelConfig(data: any): void {
    this.channel = {
      id: data.id,
      domain: data.domain,
      name: data.name,
      accessCode: data.access_code,
      apiKey: data.api_key,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      language: data.language,
      brand: {
        logo: data.logo,
        bgImage: data.bgImage,
        colorBgdPrimary: data.primaryBgColor,
        colorFgdPrimary: data.primaryFgColor,
        colorSecondary: data.secondaryColor,
        colorAccent: data.accentColor,
        colorCta: data.accentColor
      }
    };
    console.log('Channel loaded!');
    this.channelLoaded = true;
  }
}
