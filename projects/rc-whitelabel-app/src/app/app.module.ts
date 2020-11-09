
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ApiService } from './core/api.service';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from './app.config';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
  ],
  providers: [
    ApiService,
    AppConfig
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
