export * from './environments/environment';
export * from './app.component';


import {provideStore} from '@ngrx/store';

import {REDUCERS} from './shared/reducers';
import {RESOURCE_PROVIDERS} from './shared/api';


// Application wide providers
export const APP_PROVIDERS = [
  provideStore(REDUCERS),
  RESOURCE_PROVIDERS
];
