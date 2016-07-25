import {bootstrap} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import {AppComponent, environment, APP_PROVIDERS} from './app/';

import {PLATFORM_PROVIDERS} from './platform/browser';


if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent, [...PLATFORM_PROVIDERS, ...APP_PROVIDERS]);
