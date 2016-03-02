import {inject} from 'aurelia-dependency-injection';
import {Utils} from 'marvelous-aurelia-core/utils';
import {Column, ToolboxComponent, ColumnReorderingComponent, GridComponent,
  GridInternals, GridOptions, ComponentsArray} from '../all';

@inject(GridInternals, GridOptions, ComponentsArray)
export class ColumnChooserComponent extends GridComponent {
  options: IColumnChooserOptions;
  
  hidden = true;
  overDroppable = false;
  columns: Column[] = [];
  selector = {
    popUp: '.m-grid-column-chooser .m-grid-popup',
    headings: '.m-grid-headings'
  }
  
  defaultOptions: IColumnChooserOptions = {
    autoToolboxInit: true
  }
  
  constructor(private _gridInternals: GridInternals, private _gridOptions: GridOptions, private _components: ComponentsArray) {
    super();
  }
  
  start() {
    this._gridInternals.makeColumnsDraggable();
    this._listenOnDragAndDrop();
    this._listenOnColumnOwnerChanged();
    this._initToolbox();
    this._initColumns();
    
    this._components.get(ColumnReorderingComponent).enable();
  }
  
  attached() {
    this._initPopUpPosition();
  }

  saveState(state) {
    state.columns = this.columns.map(x => x.getUniqueId());
  }
  
  loadState(state) {
    this.columns = state.columns.map(x => {
      let column = this._gridOptions.getColumnByUniqueId(x);
      column.setOwner(ColumnChooserComponent);
      return column;
    });
  }
  
  togglePopUp() {
    this.hidden = !this.hidden;
  }
  
  private _initToolbox() {
    if(this.options.autoToolboxInit) {
      this._components.get(ToolboxComponent).enable();
    }
    
    let toolbox = this._components.get(ToolboxComponent).instance;
    toolbox.addButton({
      text: 'Column Chooser',
      click: () => this.togglePopUp()
    });
  }

  private _initColumns() {
    this.columns = this._gridOptions.columns.filter(x => x.hidden);
  }

  private _initPopUpPosition() {
    let popUp: any = this._gridInternals.element.querySelector(this.selector.popUp);
    let headings: any = this._gridInternals.element.querySelector(this.selector.headings);
    popUp.style.top = headings.offsetTop + headings.clientHeight + 5 + 'px';
    popUp.style.left = '5px';
  }

  private _listenOnDragAndDrop() {
    this._gridInternals.listenOnDragAndDrop({
      dropArea: this.selector.popUp,
      zIndex: 100000, // is on the top of headings
      dropped: (e, el, column) => {
        this.overDroppable = false;

        if(this.columns.indexOf(column) >= 0) {
          return;
        }

        let newMainColumns = this._gridInternals.mainColumns.filter(x => x !== column);
        if(newMainColumns.length === 0) {
          // at least one column has to exist on the main panel
          return;
        }

        column.hidden = true;
        column.setOwner(ColumnChooserComponent);
        
        this.columns.push(column);
        
        // creates a copy of columns, sorts it and then assigns sorted to displayed columns
        let sortedColumns = [];
        this.columns.forEach(x => sortedColumns.push(x));
        sortedColumns.sort(Utils.sortBy({name: 'heading', order: 'asc'}));
        this.columns = sortedColumns;
       
        this._gridInternals.mainColumns = newMainColumns;
      },
      canceled: e => {
        this.overDroppable = false;
      },
      overDroppable: (e, el, column) => {
        if(this.columns.indexOf(column) >= 0) {
          return;
        }
        this.overDroppable = true;
      },
      outsideDroppable: e => {
        this.overDroppable = false;
      }
    });
  }

  private _listenOnColumnOwnerChanged() {
    this.subs.push(this._gridInternals.subscribe('ColumnOwnerChanged', msg => {
      if(msg.column.owner === ColumnChooserComponent){
        return;
      }
      this.columns = this.columns.filter(x => x !== msg.column);
      msg.column.hidden = false;
    }));
  }

  createOptions(): IColumnChooserOptions | boolean {
    if(!this._gridOptions.domBased.has('column-chooser') && !this._gridOptions.codeBased.columnChooser) {
      return false;
    }
    
    let codeBased = this._gridOptions.codeBased.columnChooser || {};
    let options = this._gridOptions.domBased.getSingleOrDefault('column-chooser');
    options.defineIfUndefined('autoToolboxInit');
        
    return {
      autoToolboxInit: Utils.firstDefined(this.defaultOptions.autoToolboxInit, [codeBased.autoToolboxInit, options.get('autoToolboxInit').evaluate()])
    };
  }
}

export interface IColumnChooserOptions {
  autoToolboxInit: boolean;
}
