import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'rd-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {

  lastScrollTop = 0;
  hideHeader = false;

  constructor(ngz: NgZone) {
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
  }

}
