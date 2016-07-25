import {
  Http,
  Request,
  RequestOptionsArgs,
  Response,
  XHRBackend,
  RequestOptions,
  ConnectionBackend,
  Headers
} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import 'rxjs/add/observable/empty';

class HttpInterceptor extends Http {

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions,
              private _router: Router,
              private store: Store<any>) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.request(url, options));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.get(url, options));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.delete(url, options));
  }

  getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }
    return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.catch((err, source) => {
      if (err.status === 401 && !err.url.endsWith('/api/authentication')) {
        //this.store.dispatch(AuthActions.loginFailed(null));
        return Observable.empty();
      } else {
        return Observable.throw(err);
      }
    });

  }
}

export const INTERCEPTING_HTTP_PROVIDER = {
  provide: Http,
  useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions, router: Router, store: Store<any>) => new HttpInterceptor(xhrBackend, requestOptions, router, store),
  deps: [XHRBackend, RequestOptions, Router, Store]
};
