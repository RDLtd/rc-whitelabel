import { Component, OnInit, NgZone } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'rd-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {

  lastScrollTop = 0;
  hideHeader = false;
  channelLoaded = false;
  // TODO: Define and follow through all components
  brandPrimary = 'red';
  brandOnPrimaryColor = 'white';
  brandAccentColor = 'black';
  brandLogo = '';

  constructor(ngz: NgZone, public config: AppConfig) {
    window.onscroll = () => {
      const pos = window.pageYOffset;
      let hide = this.hideHeader;
      hide = pos > this.lastScrollTop;
      this.lastScrollTop = pos;
      ngz.run(() => {
        this.hideHeader = hide;
      });
    };
  }
  ngOnInit(): void {
    this.channelLoaded = !!this.config.channelAPIKey;
    this.brandPrimary = this.config.channelBackgroundColor;
    this.brandOnPrimaryColor = 'white';
    this.brandLogo = this.config.channelLogo;
  }

}
