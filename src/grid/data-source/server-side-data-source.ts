import {DataSource, IDataSourceResult} from '../all';
import {dataSourceMode} from '../constants';

export class ServerSideDataSource extends DataSource {
  static modeName = dataSourceMode.serverSide;
  private _getOnlyVisible = false;
  
  constructor(grid, options) {
    super(grid, options);
    this._getOnlyVisible = this.grid.optionsReader.get('data-source get-only-visible-columns').evaluate(); 
    
    this.grid.subs.push(this.grid.aureliaUtils.observe(this.grid.internals, 'mainColumns', () => {
      // before the initialization finish mainColumns may change, but this module is not
      // resposible for handling it - the main grid is
      if(!this.grid.initialized) {
        return;
      }

      // refresh is needed only if only visible columns are being downloaded
      // otherwise all columns are already in the memory so there's no point 
      // in refreshing the grid
      if(!this._getOnlyVisible) {
        return;
      }

      this.grid.internals.refresh();
    }));
  }

  /**
   * Serializes parameters.
   */
  beforeRead(params) {
    if(params.sortBy) {      
      params.sortBy = params.sortBy.map(x => {
        return {
          member: x.column.field,
          direction: x.direction
        };
      }); 
    }

    params.fields = this.grid.internals.mainColumns.map(x => x.field);
    
    if(this._getOnlyVisible) {
      params.getOnlyVisibleColumns = true;
    }
    
    // TODO: window.btoa doesn't work on IE9
    return {
      marvelousParams: window.btoa(JSON.stringify(params))
    };
  }

  transformResult(result, params): IDataSourceResult {
    if(result.total === undefined) {
      throw new Error(`'total' field is missing from the server-side response.`);
    }
    if(result.data === undefined) {
      throw new Error(`'data' field is missing from the server-side response.`);
    }

    if(params.pageSize) {
      // removes data if server side returens too many items
      result.data.splice(params.pageSize, result.data.length - params.pageSize)
    }

    return {
      total: result.total,
      data: result.data
    }
  }

  addItem(item) {
    this.rawResult.data.unshift(item);
    this.setNewResult(this.rawResult, this.lastParams);
  }

  removeItem(item) {
    this.rawResult.data.splice(this.rawResult.data.indexOf(item), 1);
    this.setNewResult(this.rawResult, this.lastParams);
  }
}
