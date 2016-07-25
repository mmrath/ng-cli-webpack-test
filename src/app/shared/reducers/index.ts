import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/let';
import {Observable} from 'rxjs/Observable';
import {
  authReducer,
  AuthState
} from './user-account';

export const REDUCERS = {
  auth: authReducer,
};

export interface AppState {
  auth: AuthState;
}

export function getAuthState() {
  return (state: Observable<AppState>) => state.select(s => s.auth);
}
