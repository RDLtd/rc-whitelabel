
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
  // Use subdomain to get channel config
  // Remove 'staging' prefix so that we can access the channel config
  // for testing
  const host = window.location.host.replace('staging.', '');

  console.log(`Load channel (${host})`);

  return () => {
    return data.loadChannelConfig(host)
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
