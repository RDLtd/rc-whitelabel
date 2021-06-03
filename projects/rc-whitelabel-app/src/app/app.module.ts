
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ApiService } from './core/api.service';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from './app.config';
import { DataService } from './core/data.service';

// Make App initialisation dependant on channel config
export function appStartUpFactory(data: DataService, config: AppConfig): any {
  let domain: string;
  if (window.location.host === 'localhost') {
    domain = 'directory.restaurantcollective.org.uk';
  } else {
    domain = window.location.hostname;
  }
  return () => {
    console.log(`Load channel (${domain})`);
    return data.loadChannelConfig('directory.restaurantcollective.org.uk')
      .then((res: any) => {
        console.log(res.channel_info);
        config.setChannelConfig(res.channel_info);
      })
      .catch(err => console.log('appStartUpFactory', err));
  };
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    CoreModule,
    HttpClientModule
  ],
  providers: [
    ApiService,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: appStartUpFactory,
      deps: [DataService, AppConfig],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
