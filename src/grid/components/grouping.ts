import {inject} from 'aurelia-dependency-injection';
import {ColumnReorderingComponent, Column, GridComponent, ComponentsArray, GridOptions, GridInternals} from '../all';
import {SortingComponent, SortingBucket} from './sorting';
import {sortingMode} from '../constants';
import {DomUtils} from 'marvelous-aurelia-core/utils';

// TODO: default grouped by (same for sorting)
// TODO: validation (field is required to do the grouping)
// TODO: defaultGroupable="true" then to disable grouping on column groupable="false"

@inject(ComponentsArray, GridOptions, GridInternals)
export class GroupingComponent extends GridComponent {
  options;

  selector = {
    panel: '.m-grid-grouping',
    columns: '.m-grid-grouping .m-grid-column'
  };

  columns: Column[] = [];

  dragAndDrop = {
    overDroppable: false,
    columns: undefined,
    closestColumn: undefined,
    oldDropSide: undefined,
    dropSide: undefined,
    markers: []
  }

  constructor(private _components: ComponentsArray, private _gridOptions: GridOptions, private _gridInternals: GridInternals) {
    super();
  }

  start() {
    this.listenOnDragAndDrop();
    this.listenOnColumnOwnerChanged();
    this._components.get(ColumnReorderingComponent).enable();
    
    this._components.get(SortingComponent).enable(); 
    this._components.get(SortingComponent).instance
      .addBucket(GroupingComponent, -1000, {
        mode: sortingMode.multiple,
        alwaysSorted: true
      });      
  }

  saveState(state) {
    let sorting = this.getSortingBucket();
    state.columns = this.columns.map(x => {
      return { 
        id: x.getUniqueId(),
        direction: sorting.getSortingDirection(x)
      }
    });
  }
  
  loadState(state: IState) {
    if(!state || !state.columns || !state.columns.length) {
      return;
    }
    
    let columns: IColumnWithSorting[] = [];
    
    state.columns.forEach(x => {
      columns.push({
        column: this._gridOptions.getColumnByUniqueId(x.id),
        direction: x.direction
      });      
    })
    
    this.setColumns(columns);
    this._gridInternals.refresh();
  }

  listenOnDragAndDrop() {
    this._gridInternals.listenOnDragAndDrop({
      dropArea: this.selector.panel,
      started: (e, el, column) => {
        this.dragAndDrop.columns = this._gridInternals.element.querySelectorAll(this.selector.columns);
      },
      moved: (e, el, column) => {
        this.onMoved(e, el, column);
      },
      dropped: (e, el, column) => {
        this.onDropped(e, el, column);
        this.clear();
      },
      canceled: e => {
        this.clear();
      },
      overDroppable: (e, el, column) => {
        if(!column.other.groupable) {
          return;
        }
        this.dragAndDrop.overDroppable = true;
      },
      outsideDroppable: e => {
        this.clear();
      }
    });
  }

  onMoved(e, el, column) {
    if(!column.other.groupable) {
      return;
    }

    if(!this.columns.length) {
      return;
    }

    this.dragAndDrop.closestColumn = this.getClosestColumn(e);

    if(!this.dragAndDrop.closestColumn) {
      return;
    }

    let offset = DomUtils.offset(this.dragAndDrop.closestColumn);
    if(!offset) {
      return;
    }

    this.dragAndDrop.oldDropSide = this.dragAndDrop.dropSide;

    // sets the drop side, e.g. (dragging Age column, ^ is the cursor position)
    // First Name | Last Name | Age
    //         ^                    ("right")
    // First Name | Last Name | Age
    //  ^                           ("left")
    this.dragAndDrop.dropSide = e.pageX < offset.left + (this.dragAndDrop.closestColumn.offsetWidth / 2) ? 'left' : 'right';

    if(this.dragAndDrop.dropSide && this.dragAndDrop.oldDropSide !== this.dragAndDrop.dropSide) {
      this.clearMarkers();
      this.insertMarker();
    }
  }

  onDropped(e, el, column: Column) {
    if(!column.other.groupable) {
      return;
    }

    this.dragAndDrop.overDroppable = false;

    if(this.columns.indexOf(column) == -1) {
      // if is new in the grouping panel

      let newMainColumns = this._gridInternals.mainColumns.filter(x => x !== column);
      if(newMainColumns.length === 0) {
        // at least one column has to exist on the main panel
        return;
      }

      // TODO: main grid could just listen on ColumnOwnerChanged and do it on it's own!
      this._gridInternals.mainColumns = newMainColumns;

      // column has to be added to GroupingComponent sorting bucket
      // to always apply 'multiple' mode
      this.getSortingBucket().addColumn(column);
    }

    if(!this.columns.length) {
      this.setColumns([{column: column}]);
      this._gridInternals.refresh();
      return;
    }

    let closest = this._gridOptions.getColumnByElement(this.dragAndDrop.closestColumn);
    let newColumns: Column[] = [];
    for (let c of this.columns) {
      if(c === closest && this.dragAndDrop.dropSide === 'left') {
        newColumns.push(column);
      }

      if(c !== column) {
        newColumns.push(c);
      }

      if(c === closest && this.dragAndDrop.dropSide === 'right') {
        newColumns.push(column);
      }
    }

    this.setColumns(newColumns.map(x => { return {column: x} }));
    this._gridInternals.refresh();
  }

  setColumns(columns: IColumnWithSorting[]) {
    this.columns = columns.map(x => x.column);
    
    let sorting = this.getSortingBucket();
    let order = 0;
    columns.forEach(x => {
      x.column.setOwner(GroupingComponent);
      sorting.sortBy(x.column, order++, x.direction);
    });
  }

  getSortingBucket(): SortingBucket {
    return this._components.get(SortingComponent)
      .instance.getBucketByOwner(GroupingComponent);
  }

  clearMarkers() {
    for (let marker of this.dragAndDrop.markers) {
      marker.parentNode.removeChild(marker);
    }
    this.dragAndDrop.markers = [];
  }

  insertMarker() {
    let div = document.createElement('div');
    if(this.dragAndDrop.dropSide === 'left') {
      div.setAttribute('class', 'm-grid-marker m-grid-left-marker');
      this.dragAndDrop.closestColumn.appendChild(div);
    }
    if(this.dragAndDrop.dropSide === 'right') {
      div.setAttribute('class', 'm-grid-marker m-grid-right-marker');
      this.dragAndDrop.closestColumn.insertBefore(div, this.dragAndDrop.closestColumn.firstChild);
    }
    this.dragAndDrop.markers.push(div);
  }

  clear() {
    this.clearMarkers();
    this.dragAndDrop.closestColumn = undefined;
    this.dragAndDrop.dropSide = undefined;
    this.dragAndDrop.overDroppable = false;
  }

  getClosestColumn(e) {
    let closest;
    let distance = Infinity;
    for (let column of this.dragAndDrop.columns) {
      let offset = DomUtils.offset(column);
      let d = e.pageX - column.offsetWidth - offset.left;
      let d2 = offset.left - e.pageX;

      if(d < 0 && d2 < 0) {
        // hovers current column
        closest = column;
        break;
      }

      let final = d < 0 ? d2 : d;

      if(final < distance) {
        distance = final;
        closest = column;
      }
    }

    return closest;
  }

  listenOnColumnOwnerChanged() {
    this.subs.push(this._gridInternals.subscribe('ColumnOwnerChanged', msg => {
      if(msg.column.owner === GroupingComponent){
        return;
      }

      if(msg.column.oldOwner !== GroupingComponent) {
        return;
      }

      // since column is no longer in the grouping panel
      // then it has to be removed from 'columns' and sorting bucket
      this.columns = this.columns.filter(x => x !== msg.column);
      this.getSortingBucket().removeColumn(msg.column);

      // since sorting has changed then grid has to be refreshed
      this._gridInternals.refresh();
    }));
  }

  createOptions() {
    if(!this._gridOptions.domBased.has('grouping') && !this._gridOptions.codeBased.grouping) {
      return false;
    }

    return {};
  }
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