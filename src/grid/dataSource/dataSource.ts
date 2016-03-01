import {Utils} from 'marvelous-aurelia-core/utils';
import {DataSourceManager, Grid, IDataSourceResult} from '../all';

export class DataSource {
  options;
  grid: Grid;
  result: IDataSourceResult;
  subscribers = {};
  lastReadId = 0;
  lastParams;
  rawResult;

  constructor(grid: Grid, options: any) {
    this.grid = grid;
    this.options = options;
  }

  read() {
    let currentReadId = ++this.lastReadId;
    let params = {};

    this.publish('DataRead', params);
    params = this.beforeRead(params);

    let context: IReadContext = {
      params,
      url: (baseUrl: string) => {
        return Utils.combineUrlWithParams(baseUrl, params);
      }
    }
    
    let readResult = this.options.read(context);
    if (!readResult) {
      return new Promise((resolve) => { resolve(); });
    }
    
    if (!(readResult.then instanceof Function)) {
      readResult = DataSourceManager.createReadMethod(readResult)(context);
    }

    return readResult.then(rawResult => {
      if (currentReadId !== this.lastReadId) {
        // Meanwhile new read method invokation happened
        // so an old request is no longer valid.
        // This can happen mainly in case if user clicks
        // too fast on the ui. Bad users!
        return;
      }

      this.lastParams = params;
      this.onRawResultReceived(rawResult);
      this.setNewResult(rawResult, params);
      return rawResult;
    }, error => {
      this.publish('DataReadError', error);
      return error;
    });
  }

  setNewResult(rawResult, params) {
    try {
      let result = this.transformResult(rawResult, params);
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

  subscribe(eventName, callback) {
    this.subscribers[eventName] = this.subscribers[eventName] || [];
    this.subscribers[eventName].push(callback);

    return () => {
      this.subscribers[eventName].splice(this.subscribers[eventName].indexOf(callback), 1);
    };
  }

  publish(eventName, payload) {
    let subs = this.subscribers[eventName];
    if (subs) {
      subs.forEach(sub => sub(payload));
    }

    // invokes event handler from dataSource options if defined
    // it is invoked after internals, so that all changes (e.g. page number)
    // will be available on the payload
    let userDefinedHandler = this.options['on' + eventName];
    if (userDefinedHandler instanceof Function) {
      userDefinedHandler(payload);
    }
  }

  transformResult(rawResult, params): IDataSourceResult {
    if (!rawResult.data || rawResult.total === undefined) {
      throw new Error('Missing data or total property in data source result.');
    }
    return rawResult;
  }

  addItem(item) {
    throw new Error('Not supported.');
  }

  removeItem(item) {
    throw new Error('Not supported.');
  }

  /**
   * Invoked right after data arrival.
   * @param result Contains raw data from read method.
   */
  onRawResultReceived(rawResult) {
    this.rawResult = rawResult;
  }

  /**
   * Invoked right before reading data, but after parameters creation.
   * This method should be used in order to manipulate parameters, e.g.
   * by using some sort of serialization.
   */
  beforeRead(params) {
    return params;
  }
}

export interface IDataReceivedEvent {
  result: IDataSourceResult,
  rawResult: any
}

export interface IReadContext {
  params: any;
  
  /**
   * Creates an url with Grid params attached to query string, so that
   * server side could properly handle request.
   */
  url: (baseUrl: string) => string;
}