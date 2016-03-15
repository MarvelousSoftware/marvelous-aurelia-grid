import {inject} from 'aurelia-dependency-injection';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';
import {DataSource, IDataReceivedEvent} from '../../data-source/data-source';
import {GridOptions} from '../../grid-options';
import {GridInternals} from '../../grid-internals';
import {GridComponent} from '../../pluginability';

@inject(DataSource, AureliaUtils, GridInternals, GridOptions)
export class PaginationComponent extends GridComponent {
  /** 
   * Page items.
   */  
  items: number[] = [];
  
  /**
   * Currently selected page.
   */
  selected = 1;
  
  /**
   * Total number of items in data source.
   */
  total: number;
  
  /**
   * Last page. Might be not visible on the UI if is out of range.
   */
  lastPage: number;
  
  buttons = {
    prev: false,
    next: false,
    leftSideOutOfRange: false,
    rightSideOutOfRange: false
  };
  
  options: IPaginationOptions;
  defaultOptions: IPaginationOptions = {
    size: 20,
    all: false,
    range: 4
  };

  constructor(private _dataSource: DataSource, private _aureliaUtils: AureliaUtils, private _gridInternals: GridInternals,
  private _gridOptions: GridOptions) {
    super();
  }
  
  start() {
    this.subs = [
      this._dataSource.subscribe('DataRead', params => this._onDataRead(params)),
      this._dataSource.subscribe('DataReceived', (e: IDataReceivedEvent) => this._onDataReceived(e)),
      this._aureliaUtils.observe(this.options, 'size', (newVal, oldVal) => this._onPageSizeChanged(newVal, oldVal))
    ]
  }

  changePage(newPage) {
    if(newPage === this.selected) {
      return;
    }
    
    this.selected = newPage;
    this._gridInternals.refresh();
  }
  
  selectFirst() {
    this.changePage(1);
  }
  selectLast() {
    this.changePage(this.lastPage);
  }
  selectNext() {
    if(this.selected >= this.lastPage) {
      return;
    }
    
    this.changePage(this.selected + 1);
  }
  selectPrev() {
    if(this.selected <= 1) {
      return;
    }
    
    this.changePage(this.selected - 1);
  }
  
  private _onDataRead(params) {
    params.page = this.selected;
    params.pageSize = this.options.size;
  }

  private _onDataReceived(e: IDataReceivedEvent) {
    let total = e.result.total;
    let items = [];
    this.lastPage = Math.ceil(total/this.options.size);
    
    let startPage = this.selected - this.options.range;
    if(startPage < 1) {
      startPage = 1;
    }
    let endPage = this.selected + this.options.range;
    
    if(endPage > this.lastPage) {
      endPage = this.lastPage;
    }
    
    this.buttons.rightSideOutOfRange = this.lastPage > endPage;
    this.buttons.leftSideOutOfRange = startPage !== 1;    
    this.buttons.next = this.selected !== this.lastPage;
    this.buttons.prev = this.selected !== 1;
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    this.items = items;

    if(this.total === total) {
      return;
    }

    this.total = total;
  }

  private _onPageSizeChanged(newVal, oldVal) {
    if(newVal != oldVal) {
      this.selected = 1;
      this._gridInternals.refresh();
    }
  }
  
  createOptions(): IPaginationOptions {
    let pagination = this._gridOptions.reader.get('pagination');
    
    if(!pagination.truthy) {
      return;
    }

    let options = {
      size: parseInt(pagination.get('size').evaluate(this.defaultOptions.size)),
      all: pagination.get('all').evaluate(this.defaultOptions.all),
      range: parseInt(pagination.get('range').evaluate(this.defaultOptions.range))
    };
    return options;
  }  
}

export interface IPaginationOptions {
  size?: number;
  all?: boolean|number[];
  range?: number;
}