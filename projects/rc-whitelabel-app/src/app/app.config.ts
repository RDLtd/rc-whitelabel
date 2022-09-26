import { environment } from '../environments/environment';

export interface Brand {
  imgLogo: string;
  imgBgd: string;
  clrHeaderBgd: string;
  clrHeaderFgd: string;
  clrFooterBgd: string;
  clrFooterFgd: string;
  clrPrimary: string;
  clrAccent: string;
  clrPrimaryCta: string;
  clrOffers: string;
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
  openGraph: any;
  analyticsId?: string;
  rcLogo?: string;
}
export class AppConfig {
  // Api
  public readonly apiUrl = environment.API_URL;
  public readonly geoApiKey = environment.GOOGLE_MAP_API_KEY;
  public testMode = environment.testMode;

  public readonly spwMarkerDomain = environment.SPW_DOMAIN_PATH;
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
      rcLogo: data.logoRC || null,
      brand: {
        imgLogo: data.logo,
        imgBgd: data.bgImage,
        clrHeaderBgd: data.primaryBgColor,
        clrHeaderFgd: data.primaryFgColor,
        clrFooterBgd: data.secondaryColor,
        clrFooterFgd: data.primaryFgColor,
        clrPrimary: data.primaryBgColor,
        clrAccent: data.accentColor,
        clrPrimaryCta: data.primaryCtaColor,
        clrOffers: data.primaryBgColor,
      },
      openGraph: {
          title: `${ data.name } ${ data.ogTitle }`,
          image: data.ogImage,
          alt: data.ogImageAlt,
          url: data.ogUrl
      }
    };
    console.log('Channel loaded!');
    this.channelLoaded = true;
  }
}
