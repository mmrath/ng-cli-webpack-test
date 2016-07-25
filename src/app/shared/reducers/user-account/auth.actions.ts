import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';


/**
 * Instead of passing around action string constants and manually recreating
 * action objects at the point of dispatch, we create services encapsulating
 * each appropriate action group. Action types are included as static
 * members and kept next to their action creator. This promotes a
 * uniform interface and single import for appropriate actions
 * within your application components.
 */
@Injectable()
export class AuthActions {
  static LOGIN_SUCCESS = '[AUTH] Login success';

  static loginSuccess(user: any): Action {
    return {type: AuthActions.LOGIN_SUCCESS, payload: user};
  }

  static LOGIN_FAILED = '[AUTH] Login failed';

  static loginFailed(error: any): Action {
    return {type: AuthActions.LOGIN_FAILED, payload: error};
  }

  static LOGOUT_SUCCESS = '[AUTH] Logout success';

  static logoutSuccess(): Action { return {type: AuthActions.LOGOUT_SUCCESS, payload: null}; }
}
