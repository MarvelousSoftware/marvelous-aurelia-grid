import {inject} from 'aurelia-dependency-injection';
import {DataSource, GridOptions, GridInternals, GridComponent} from '../common-imports';
import {IRowClickEvent, rowTypes, GridRenderer} from '../../gridRenderer';

@inject(GridInternals, GridOptions, DataSource)
export class SelectionComponent extends GridComponent {
  options: ISelectionOptions;

  selectedItems: any[] = [];

  constructor(private _gridInternals: GridInternals, private _gridOptions: GridOptions, private _dataSource: DataSource) {
    super();
  }

  start() {    
    this.subs = [
      this._gridInternals.subscribe('RowClick', (event: IRowClickEvent) => this._onRowClick(event)),
      this._dataSource.subscribe('DataRead', params => this.clear())
    ]
  }

  clear() {
    this.selectedItems.splice(0);
  }

  private _onRowClick(event: IRowClickEvent) {
    const selectedClass = 'm-row-selected';

    if (event.row.type !== rowTypes.data) {
      return;
    }

    if (this.options.multiple === false) {
      this._gridInternals.renderer.rows.forEach(row => row.removeClass(selectedClass));
      this.selectedItems.splice(0);
    }

    if (event.row.hasClass(selectedClass)) {
      event.row.removeClass(selectedClass);
      let itemIndex = this.selectedItems.indexOf(event.row.data);
      if (itemIndex === -1) {
        return;
      }

      this.selectedItems.splice(itemIndex, 1);
      return;
    }

    this.selectedItems.push(event.row.data);
    event.row.addClass(selectedClass);
  }

  createOptions(): ISelectionOptions {
    let selection = this._gridOptions.reader.get('selection');
    if (!selection) {
      return;
    }

    return {
      multiple: !!selection.get('multiple').evaluate()
    }
  }
}

export interface ISelectionOptions {
  multiple: boolean;
}