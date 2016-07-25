import {Action, ActionReducer} from '@ngrx/store';
import {AuthActions} from './auth.actions';

export interface AuthState {
  authenticated: boolean;
  user: any;
  error: any;
}

let initialState: AuthState = {authenticated: false, user: null, error: null};

export const authReducer: ActionReducer<AuthState> = (state = initialState, action: Action) => {

  switch (action.type) {
    case AuthActions.LOGIN_SUCCESS:
      return Object.assign({}, state, {user: action.payload, error: null, authenticated: true});

    case AuthActions.LOGIN_FAILED:
      return Object.assign({}, state, {user: null, error: action.payload, authenticated: false});

    case AuthActions.LOGOUT_SUCCESS:
      return Object.assign({}, {user: null, error: null, authenticated: false});

    default:
      return state;
  }
};
