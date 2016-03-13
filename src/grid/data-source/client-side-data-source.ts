import {Utils} from 'marvelous-aurelia-core/utils';
import {DataSource, IDataSourceResult} from '../all';
import {dataSourceMode} from '../constants';

export class ClientSideDataSource extends DataSource {
  static modeName = dataSourceMode.clientSide;

  transformResult(result, params): IDataSourceResult {
    let total = result.length;
    result = result.slice(result);

    if(params.sortBy && params.sortBy.length) {
      let sortBy = [];
      params.sortBy.forEach(x => {
        sortBy.push({
          name: x.column.field,
          order: x.direction
        });
      });
      result = result.sort(Utils.sortByMultiple(sortBy));
    }

    if(params.page && params.pageSize) {
      let skip = (params.page - 1) * params.pageSize;
      result.splice(0, skip);
      result.splice(params.pageSize, result.length - params.pageSize)
    }

    return {
      total: total,
      data: result
    }
  }

  addItem(item) {
    this.rawResult.unshift(item);
    this.setNewResult(this.rawResult, this.lastParams);
  }

  removeItem(item) {
    this.rawResult.splice(this.rawResult.indexOf(item), 1);
    this.setNewResult(this.rawResult, this.lastParams);
  }
}