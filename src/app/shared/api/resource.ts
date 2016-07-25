import {Inject, provide, Provider} from '@angular/core';
import {
  Http,
  Headers as AngularHeaders,
  Request,
  RequestOptions,
  RequestMethod as RequestMethods,
  Response,
  URLSearchParams
} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Page, PageRequest} from '../models/core/';

export const RESOURCE_PROVIDERS: Provider[] = [];
export interface ResourceConfigParam { url: string;
}
/**
 * Set the base URL of REST resource
 * @param {String} url - base URL
 */
export function ResourceConfig(param: ResourceConfigParam) {
  return function (target: {new (http: Http): Resource<any>}) {
    RESOURCE_PROVIDERS.push(
      provide(target, {useFactory: (http: Http) => new target(http), deps: [Http]}));
    target.prototype.getBaseUrl = function () {
      return param.url;
    };
    // return Target;
  };
}

/**
 * Set default headers for every method of the Resource
 * @param {Object} headers - deafult headers in a key-value pair
 */
export function DefaultHeaders(headers: any) {
  return function<TFunction extends Function>(target: TFunction): TFunction {
    target.prototype.getDefaultHeaders = function () {
      return headers;
    };
    return target;
  };
}

function paramBuilder(paramName: string) {
  return function (key: string) {
    return function (target: Resource<any>, propertyKey: string|symbol, parameterIndex: number) {
      let metadataKey = `${propertyKey}_${paramName}_parameters`;
      let paramObj: any = {key: key, parameterIndex: parameterIndex};
      if (Array.isArray(target[metadataKey])) {
        target[metadataKey].push(paramObj);
      } else {
        target[metadataKey] = [paramObj];
      }
    };
  };
}

/**
 * Url for the request, type: string.
 * This will override the value of BaseUrl
 * @param {string} url - url path to bind value
 */
export const Url = paramBuilder('Url');

/**
 * Path variable of a method's url, type: string
 * @param {string} key - path key to bind value
 */
export var Path = paramBuilder('Path');
/**
 * Query value of a method's url, type: string
 * @param {string} key - query key to bind value
 */
export var Query = paramBuilder('Query')('query');
/**
 * Body of a REST method, type: key-value pair object
 * Only one body per method!
 */
export var Body = paramBuilder('Body')('Body');
/**
 * Custom header of a REST method, type: string
 * @param {string} key - header key to bind value
 */
export var Header = paramBuilder('Header');

/**
 * Set custom headers for a REST method
 * @param {Object} headersDef - custom headers in a key-value pair
 */
export function Headers(headersDef: any) {
  return function (target: Resource<any>, propertyKey: string, descriptor: any) {
    descriptor.headers = headersDef;
    return descriptor;
  };
}


/**
 * Defines the media type(s) that the methods can produce
 * @param responseMediaType  - mediaType to be parsed
 */
export function Produces(responseMediaType: MediaType) {
  return function (target: Resource<any>, propertyKey: string, descriptor: any) {
    descriptor.mediaType = responseMediaType;
    return descriptor;
  };
}


/**
 * Supported @Produces media types
 */
export enum MediaType {
  JSON,
  RAW  // No transalation
}


function methodBuilder(method: number) {
  return function (url?: string) {
    return function (target: Resource<any>, propertyKey: string, descriptor: any) {

      let pUrl = target[`${propertyKey}_Url_parameters`];
      let pPath = target[`${propertyKey}_Path_parameters`];
      let pQuery = target[`${propertyKey}_Query_parameters`];
      let pBody = target[`${propertyKey}_Body_parameters`];
      let pHeader = target[`${propertyKey}_Header_parameters`];

      descriptor.value = function (...args: any[]) {


        // Body
        let body = null;
        if (pBody) {
          let bodyObj = args[pBody[0].parameterIndex]
          if (typeof bodyObj === 'string') {
            body = bodyObj;
          } else {
            body = JSON.stringify(args[pBody[0].parameterIndex]);
          }
        }

        // Path
        let resUrl = '';
        if (typeof url === 'string') {
          resUrl = url;
        }
        if (pPath) {
          for (var k in pPath) {
            if (pPath.hasOwnProperty(k)) {
              resUrl = resUrl.replace('{' + pPath[k].key + '}', args[pPath[k].parameterIndex]);
            }
          }
        }

        // Query
        let search = new URLSearchParams();
        if (pQuery) {
          pQuery
            .filter(p => args[p.parameterIndex])  // filter out optional parameters
            .forEach(p => {
              let searchParams = args[p.parameterIndex];
              for (let key in searchParams) {
                if (!searchParams.hasOwnProperty(key)) {
                  continue;
                }
                let value: any = searchParams[key];
                if (value === undefined || value === null) {
                  continue;
                }
                if (Array.isArray(value)) {
                  let valueArr = value as Array<any>;
                  valueArr.forEach(obj => {
                    let arrParamValue = obj;
                    if (obj instanceof Object) {
                      arrParamValue = JSON.stringify(obj);
                    }
                    search.append(key, arrParamValue);
                  });
                } else if (value instanceof Object) {
                  // stringify it
                  value = JSON.stringify(value);
                  search.set(key, value); // No append for non arrays
                } else {
                  search.set(key, value); // No append for non arrays
                }
              }
            });
        }

        // Headers
        // set class default headers
        let headers = new AngularHeaders(this.getDefaultHeaders());
        // set method specific headers
        for (let key in descriptor.headers) {
          if (descriptor.headers.hasOwnProperty(key)) {
            headers.append(key, descriptor.headers[key]);
          }
        }
        // set parameter specific headers
        if (pHeader) {
          for (let key1 in pHeader) {
            if (pHeader.hasOwnProperty(key1)) {
              headers.append(pHeader[key1].key, args[pHeader[key1].parameterIndex]);
            }
          }
        }

        if (headers.keys().length === 0) {
          // Since no headers specified, use json by default
          headers.append('Content-Type', 'application/json');
        }

        let overrideUrl = null;
        if (pUrl) {
          overrideUrl = args[pUrl[0].parameterIndex] + resUrl;
        } else {
          overrideUrl = this.getBaseUrl() + resUrl;
        }
        // Request options
        let options = new RequestOptions({method, url: overrideUrl, headers, body, search});

        let req = new Request(options);

        // intercept the request
        this.requestInterceptor(req);

        // make the request and store the observable for later transformation
        let observable: Observable<Response> = this.http.request(req);

        // transform the observable in accordance to the @Produces decorator
        if (typeof descriptor.mediaType === 'undefined' ||
          descriptor.mediaType === MediaType.JSON) {
          observable = observable.map(res => {
            try {
              return res.json();
            } catch (e) {
              return res;
            }
          });
        }

        // intercept the response
        observable = this.responseInterceptor(observable);

        return observable;
      };
      return descriptor;
    };
  };
}

/**
 * GET method
 * @param {string} url - resource url of the method
 */
export var GET = methodBuilder(RequestMethods.Get);
/**
 * POST method
 * @param {string} url - resource url of the method
 */
export let POST = methodBuilder(RequestMethods.Post);
/**
 * PUT method
 * @param {string} url - resource url of the method
 */
export let PUT = methodBuilder(RequestMethods.Put);
/**
 * DELETE method
 * @param {string} url - resource url of the method
 */
export let DELETE = methodBuilder(RequestMethods.Delete);


/*
 * Angular 2 Resource class.
 *
 * @class Resource
 * @constructor
 */
export class Resource<T> {
  public constructor(@Inject(Http) protected http: Http) {
  }

  protected getBaseUrl(): string {
    return null;
  };

  protected getDefaultHeaders(): Object {
    return null;
  };

  /**
   * Request Interceptor
   *
   * @method requestInterceptor
   * @param {Request} req - request object
   */
  protected requestInterceptor(req: Request) {
  }

  /**
   * Response Interceptor
   *
   * @method responseInterceptor
   * @param {Response} res - response object
   * @returns {Response} res - transformed response object
   */
  protected responseInterceptor(res: Observable<any>): Observable<any> {
    return res;
  }

  @GET('/{id}')
  findOne(@Path('id') id: any): Observable<T> {
    return null;
  }

  @POST()
  save(@Body body: any): Observable<T> {
    return null;
  }

  @PUT('/{id}')
  update(@Path('id') id: any, @Body body: T): Observable<T> {
    return null;
  }

  @DELETE('/{id}')
  delete(@Path('id') id: any): Observable<T> {
    return null;
  }

  /**
   * Generally used in List windows, this function supports paging ordering and searching
   * @param pageRequest
   * @param searchParams
   * @returns {null}
   */
  @GET()
  find(@Query pageRequest?: PageRequest, @Query searchParams?: any): Observable<Page<T>> {
    return null;
  }

  /**
   * Queries for all records with an assumed limit of 5000 records
   * @returns an array of objects
   */
  findAll(): Observable<T[]> {
    return this.find({page: 0, size: 5000, sort: undefined}).map(page => page.content);
  }
}
