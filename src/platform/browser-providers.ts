/*
 * These are globally available services in any component or any other service
 */

// Angular 2
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {HTTP_PROVIDERS, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';
import {provideRouter} from '@angular/router';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {MATERIAL_PROVIDERS} from './material2';

import {routes} from '../app/app.routes';
import {INTERCEPTING_HTTP_PROVIDER} from '../app/shared/api/http-interceptor';
// Angular 2 Http
// Angular 2 Router
// Angular 2 forms

// AngularClass
/*
 * Application Providers/Directives/Pipes
 * providers/directives/pipes that only live in our browser environment
 */
export const APPLICATION_PROVIDERS = [
  // new Angular 2 forms
  disableDeprecatedForms(),
  provideForms(),
  provideRouter(routes),
  ...HTTP_PROVIDERS,
  INTERCEPTING_HTTP_PROVIDER,
  {provide: XSRFStrategy, useValue: new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')},
  {provide: LocationStrategy, useClass: HashLocationStrategy},
  ...MATERIAL_PROVIDERS
];

export const PROVIDERS = [
  ...APPLICATION_PROVIDERS
];
