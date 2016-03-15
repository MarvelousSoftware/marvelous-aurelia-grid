import {Utils} from 'marvelous-aurelia-core/utils';
import {ClientSideDataSource} from './client-side-data-source';
import {ServerSideDataSource} from './server-side-data-source';
import {IReadContext} from './data-source';
import {Grid} from '../grid';

export class DataSourceManager {
  private _dataSources = {};
  private _options;

  constructor(public grid: Grid) {
    this._options = this.createOptions();

    // TODO: custom data sources (on app configure?)
    this.add(ClientSideDataSource.modeName, x => new ClientSideDataSource(x, this._options));
    this.add(ServerSideDataSource.modeName, x => new ServerSideDataSource(x, this._options));
  }

  add(mode, create) {
    if(this._dataSources[mode]) {
      throw new Error(`DataSource with ${mode} mode already declared.`);
    }

    this._dataSources[mode] = create;
  }

  createDataSource() {
    let mode = this._options.mode;
    if(!this._dataSources[mode]) {
      throw new Error(`'${mode}' mode is not defined.`);
    }

    return this._dataSources[mode](this.grid, this._options);
  }

  createOptions() {
    let options = this.grid.options.reader.get('data-source');
    let ds: any = {};
    ds.read = options.get('read').evaluate(); 
    
    if(!ds.read) {
      throw new Error('dataSource.read method not defined. Please delare it in the options.');
    }

    let read = Utils.createReadFunction(ds.read, {
      params: (context:IReadContext) => context.params,
			allowData: true,
      allowUndefined: true,
			shouldReturnUrlOrPromiseError: '`read` function should return url or promise or data.'
		});

    ds.read = read;
    ds.mode = options.get('mode').evaluate(ClientSideDataSource.modeName);
    ds.debounce = ds.debounce || 50;
    
    return ds;
  }

  static createReadMethod(read) {
    if(read instanceof Function) {
      return read;
    }
    if(typeof read == "string") {
      // read should be an url
      return (context: IReadContext) => Utils.sendAjax(read, context.params);
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
}