import {noView} from 'aurelia-templating';
import {inject} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';
import {Column} from '../models/column';
import {GridComponent} from '../pluginability';
import {Grid} from '../grid';
import {GridOptions} from '../gridOptions';
import {GridInternals} from '../gridInternals';
import {DataSource} from '../dataSource/dataSource';
import {sortingMode} from '../constants';

@inject(GridOptions, GridInternals, DataSource)
export class SortingComponent extends GridComponent {
  options: IOptions;
  sortOrder = 0;

  defaultOptions = {
    mode: sortingMode.single
  };

  buckets: IOwnedBucket[] = [];
  subs = [];

  constructor(private _gridOptions: GridOptions, private _gridInternals: GridInternals, private _dataSource: DataSource) {
    super();
  }

  start() {
    // adds main bucket
    this.addBucket(SortingComponent, 0, {
      mode: this.options.mode,
      alwaysSorted: false
    });

    this.subs = [
      this._gridInternals.subscribe('ColumnClicked', column => this.onColumnClicked(column)),
      this._dataSource.subscribe('DataRead', params => this.onDataRead(params))
    ]
  }

  onDataRead(params) {
    params.sortBy = [];

    this.buckets.forEach(x => {
      let bucketSortedColumns = [];

      x.bucket.columns.forEach(c => {
        if (c.state.sortByDirection !== undefined && c.state.sortOrder !== undefined) {
          bucketSortedColumns.push({
            column: c,
            sortOrder: c.state.sortOrder,
            sortByDirection: c.state.sortByDirection
          });
        }
      });

      bucketSortedColumns = bucketSortedColumns.sort(Utils.sortBy({ name: 'sortOrder' }));
      bucketSortedColumns.forEach(x => params.sortBy.push({
        column: x.column,
        direction: x.sortByDirection
      }));
    });
  }

  saveState(state) {
    let sorting = this.getBucketByOwner(SortingComponent);
    state.columns = sorting.columns.map(x => {
      return {
        id: x.getUniqueId(),
        direction: sorting.getSortingDirection(x)
      }
    });
  }

  loadState(state: IState) {
    if (!state || !state.columns || !state.columns.length) {
      return;
    }

    let sorting = this.getBucketByOwner(SortingComponent);
    let order = 1;
    state.columns.forEach(x => {
      let column = this._gridOptions.getColumnByUniqueId(x.id);
      sorting.sortBy(column, order++, x.direction);
    });

    this._gridInternals.refresh();
  }

  onColumnClicked(column: Column) {
    let isSortingEnabled = column.other.sortable !== undefined && column.other.sortable !== "false" && column.other.sortable !== false;
    if (!isSortingEnabled) {
      return;
    }

    let bucket = this.getBucketByColumn(column) || this.getBucketByOwner(SortingComponent);
    if (!bucket.hasSortingApplied(column)) {
      bucket.sortBy(column, ++this.sortOrder, 'asc');
    } else {
      bucket.nextSortingDirectionOn(column);
    }

    this._gridInternals.refresh();
  }

  addBucket(owner: Function, order: number, options: ISortingBucketOptions) {
    let ownedBucket = {
      owner: owner,
      bucket: new SortingBucket(options),
      order: order
    };
    this.buckets.push(ownedBucket);
    this.buckets = this.buckets.sort(Utils.sortBy({ name: 'order' }));
    return ownedBucket.bucket;
  }

  getBucketByColumn(column: Column): SortingBucket {
    let buckets = this.buckets.filter(x => x.bucket.hasColumn(column));
    if (!buckets.length) {
      return;
    }
    return buckets[0].bucket;
  }

  getBucketByOwner(owner: Function): SortingBucket {
    let buckets = this.buckets.filter(x => x.owner === owner);
    if (!buckets.length) {
      return;
    }
    return buckets[0].bucket;
  }

  createOptions(): any {
    if (!this._gridOptions.domBased.has('sorting') && !this._gridOptions.codeBased.sorting) {
      return false;
    }

    let sorting = this._gridOptions.domBased.getSingleOrDefault('sorting');
    let codeBased = this._gridOptions.codeBased.sorting || {};
    sorting.defineIfUndefined('mode');

    return {
      mode: sorting.get('mode').evaluate() || codeBased.mode || this.defaultOptions.mode
    };
  }
}

/**
 * General remarks:
 * Sorting component could be a lot simpler if it would be used only by
 * the end-user. Unfortunatelly it is also used internally by grouping component
 * which requires to sort columns in the seperation of main panel. 
 * Grouped columns should always be sorted first and have 'multiple' mode.
 * That's why buckets are implemented.
 */
export class SortingBucket {
  options: ISortingBucketOptions;
  columns: Column[] = [];

  constructor(options: ISortingBucketOptions) {
    this.options = options;
  }

  sortBy(column: Column, order: number, direction: string) {
    if (this.options.mode === sortingMode.single) {
      this.columns.filter(x => x !== column).forEach(x => {
        this._clearColumn(x);
      });
    }

    direction = direction || column.state.sortByDirection || 'asc';

    this._manageColumnClasses(column, direction);
    column.state.sortByDirection = direction;
    column.state.sortOrder = order;

    this.addColumn(column);
  }

  nextSortingDirectionOn(column: Column) {
    if (!this.hasColumn(column)) {
      return;
    }

    switch (column.state.sortByDirection) {
      case 'asc':
        column.state.sortByDirection = 'desc';
        column.addClass('m-grid-sort-desc');
        column.removeClass('m-grid-sort-asc');
        break;
      case 'desc':
        if (this.options.alwaysSorted) {
          column.state.sortByDirection = 'asc';
          column.addClass('m-grid-sort-asc');
          column.removeClass('m-grid-sort-desc');
          break;
        }
      default:
        this._clearColumn(column);
        break;
    }
  }

  hasSortingApplied(column: Column) {
    return !!this.getSortingDirection(column);
  }

  getSortingDirection(column: Column): string {
    return column.state.sortByDirection;
  }

  addColumn(column: Column) {
    if (this.hasColumn(column)) {
      return;
    }
    this.columns.push(column);
  }

  removeColumn(column: Column) {
    if (!this.hasColumn(column)) {
      return;
    }

    this._clearColumn(column);
  }

  hasColumn(column: Column) {
    if (this.columns.indexOf(column) == -1) {
      return false;
    }
    return true;
  }

  private _clearColumn(column: Column) {
    column.removeClass('m-grid-sort-asc');
    column.removeClass('m-grid-sort-desc');

    delete column.state.sortByDirection;
    delete column.state.sortOrder;

    Utils.removeFromArray(this.columns, column);
  }
  private _manageColumnClasses(column: Column, direction: string) {
    switch (direction) {
      case 'asc':
        column.addClass('m-grid-sort-asc');
        column.removeClass('m-grid-sort-desc');
        break;
      case 'desc':
        column.addClass('m-grid-sort-desc');
        column.removeClass('m-grid-sort-asc');
        break;
      default:
        throw new Error(`${direction} is not a valid value for a column sort direction.`);
        break;
    }
  }
}

export interface IOwnedBucket {
  owner: Function,
  bucket: SortingBucket,
  order: number
}

export interface IColumnWithSorting {
  column: Column,
  direction?: string
}

export interface IState {
  columns: IColumnState[]
}

export interface IColumnState {
  id: string,
  direction: string
}

export interface IOptions {
  mode: string;
}

export interface ISortingBucketOptions {
  mode: string,
  alwaysSorted: boolean;
}