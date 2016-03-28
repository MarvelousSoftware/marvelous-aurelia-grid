import {inject} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';
import {GridOptions} from '../grid-options';
import {GridInternals} from '../grid-internals';

@inject(GridOptions, GridInternals)
export class DataSource {
  options: IDataSourceOptions;
  state: IDataSourceState;
  result: IDataSourceResult;
  
  private _lastReadId = 0;
  
  constructor(private _gridOptions: GridOptions, private _gridInternals: GridInternals) {
    this.options = this.createOptions();
    this.state = this.createState();
  }

  read() {
    let currentReadId = ++this._lastReadId;
    this.publish('DataRead', {});
    let state = this.state;

    let context: IReadContext = {
      state: state,
      url: (baseUrl: string) => {
        return Utils.combineUrlWithParams(baseUrl, this.serializeState(state));
      }
    }

    let readResult = this.options.read(context);
    if (!readResult) {
      return new Promise((resolve) => { resolve(); });
    }

    if (!(readResult.then instanceof Function)) {
      readResult = this._createReadMethod(readResult, state)(context);
    }

    return readResult.then(rawResult => {
      if (currentReadId !== this._lastReadId) {
        // Meanwhile new read method invokation happened
        // so an old request is no longer valid.
        // This can happen mainly in case if user clicks
        // too fast on the ui. Bad user!
        return;
      }

      this._setNewResult(rawResult, state);
      return rawResult;
    }, error => {
      this.publish('DataReadError', error);
      return error;
    });
  }
  
  private _setNewResult(rawResult: any, state: IDataSourceState) {
    try {
      let result = this.transform(rawResult, state);
      this.result = result;

      let eventPayload: IDataReceivedEvent = {
        result: result,
        rawResult: rawResult
      }
      this.publish('DataReceived', eventPayload);
    } catch (e) {
      if (console.error) {
        console.error(e);
      }
    }
  }
  
  transform(rawResult: any, state: IDataSourceState): IDataSourceResult {
    if (!rawResult.data || rawResult.total === undefined) {
      throw new Error(`Missing 'data' or 'total' property in data source result.`);
    }
    return rawResult;
  }
  
  /**
   * Should return serialized version of state, so that it could be read by
   * data source endpoint (e.g. server API).
   */
  serializeState(state: IDataSourceState) {
    return state;
  }
  
  publish(eventName: string, payload: any) {
    this._gridInternals.publish('data-source:' + eventName, payload);
  }
  
  subscribe(eventName: string, callback: (payload:any)=>void) {
    // TODO: subscribe should allow to declare listener in options, e.g.
    // <m-grid><data-source on-data-read="refresh($event)"></data-source></m-grid>
    return this._gridInternals.subscribe('data-source:' + eventName, callback);
  }
  
  private _createReadMethod(read: any, state: IDataSourceState) {
    if(read instanceof Function) {
      return read;
    }
    if(typeof read == "string") {
      // read should be an url
      return (context: IReadContext) => Utils.sendAjax(read, this.serializeState(state));
    }

    return function () {
      let result = {
        then: undefined
      };
      result.then = function (callback) {
        callback(read);
        return result;
      };
      return result;
    }
  }
  
  createState(): IDataSourceState {
    return {
      page: 1,
      pageSize: 20 // TODO: get from config once it's there (currently it's in the pagination component)
    };
  }

  createOptions(): IDataSourceOptions {
    let dataSource = this._gridOptions.reader.get('data-source');
    let options: IDataSourceOptions = <any>{};
    options.read = dataSource.get('read').evaluate();

    if (!options.read) {
      throw new Error('dataSource.read method not defined. Without it grid cannot read any data.');
    }

    let read = Utils.createReadFunction(options.read, {
      params: (context: IReadContext) => this.serializeState(context.state),
      allowData: true,
      allowUndefined: true,
      shouldReturnUrlOrPromiseError: '`read` function should return either url, promise or data.'
    });

    options.read = read;
    return options;
  }
}

export interface IDataSourceOptions {
  /**
   * Gets data using provided context.
   */
  read: (context: any) => Promise<any>;
}

export interface IDataSourceState {
  [key: string]: any;
  
  /**
   * Current page.
   */
  page: number;
  
  /**
   * Page size.
   */
  pageSize: number;
}

export interface IReadContext {
  /**
   * State of data source.
   */
  state: IDataSourceState;

  /**
   * Creates an url with Grid params attached to query string, so that
   * server side could properly handle request.
   */
  url: (baseUrl: string) => string;
}

export interface IDataSourceResult {
  data: any[],
  total: number
}

export interface IDataReceivedEvent {
  result: IDataSourceResult,
  rawResult: any
}