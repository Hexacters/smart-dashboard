import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from '../@cpm/shared/shared.module';
import { ModulesModule } from './modules/modules.module';
import { HeaderComponent } from './core/header/header.component';
import { SidenavComponent } from './core/sidenav/sidenav.component';
import { FooterComponent } from './core/footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { NotificationComponent } from './core/header/notification/notification.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UrlHandlingStrategy } from '@angular/router';
import { LocationUpgradeModule } from '@angular/common/upgrade';
import { ModalComponent } from './modal/modal.component';


export class CustomHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url) {
    console.log(url.toString(), !!url.toString().startsWith('/home'));
    const shouldProcess = !!url.toString().startsWith('/home') || (url.toString() === '/');
    return shouldProcess;
  }
  extract(url) {
    return url;
  }
  merge(url, whole) {
    return url;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavComponent,
    FooterComponent,
    NotificationComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    UpgradeModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MatNativeDateModule,
    ModulesModule,
    NgbModule,
    LocationUpgradeModule.config({
      useHash: true,
      hashPrefix: '!'
    })
  ],
  providers: [{
    provide: UrlHandlingStrategy, useClass: CustomHandlingStrategy
  }],
  bootstrap: [AppComponent],
  entryComponents: [ModalComponent]
})
export class AppModule { }
