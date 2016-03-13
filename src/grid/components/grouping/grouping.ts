import {inject} from 'aurelia-dependency-injection';
import {ColumnReorderingComponent, Column, GridComponent, ComponentsArray, GridOptions, GridInternals} from '../../all';
import {SortingComponent, SortingBucket} from '../sorting';
import {sortingMode} from '../../constants';
import {DomUtils} from 'marvelous-aurelia-core/utils';

// TODO: default grouped by (same for sorting)
// TODO: validation (field is required to do the grouping)
// TODO: defaultGroupable="true" then to disable grouping on column groupable="false"

@inject(ComponentsArray, GridOptions, GridInternals)
export class GroupingComponent extends GridComponent {
  private _selector = {
    panel: '.m-grid-grouping',
    columns: '.m-grid-grouping .m-grid-column'
  };

  columns: Column[] = [];

  private _dragAndDrop = {
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
    this._listenOnDragAndDrop();
    this._listenOnColumnOwnerChanged();
    this._components.get(ColumnReorderingComponent).enable();
    
    this._components.get(SortingComponent).enable(); 
    this._components.get(SortingComponent).instance
      .addBucket(GroupingComponent, -1000, {
        mode: sortingMode.multiple,
        alwaysSorted: true
      });      
  }

  saveState(state) {
    let sorting = this._getSortingBucket();
    state.columns = this.columns.map(x => {
      return { 
        id: x.getUniqueId(),
        direction: sorting.getSortingDirection(x)
      }
    });
  }
  
  loadState(state: IGroupingState) {
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
    
    this._setColumns(columns);
    this._gridInternals.refresh();
  }

  private _listenOnDragAndDrop() {
    this._gridInternals.listenOnDragAndDrop({
      dropArea: this._selector.panel,
      started: (e, el, column) => {
        this._dragAndDrop.columns = this._gridInternals.element.querySelectorAll(this._selector.columns);
      },
      moved: (e, el, column) => {
        this._onMoved(e, el, column);
      },
      dropped: (e, el, column) => {
        this._onDropped(e, el, column);
        this._clear();
      },
      canceled: e => {
        this._clear();
      },
      overDroppable: (e, el, column) => {
        if(!column.other.groupable) {
          return;
        }
        this._dragAndDrop.overDroppable = true;
      },
      outsideDroppable: e => {
        this._clear();
      }
    });
  }

  private _onMoved(e, el, column) {
    if(!column.other.groupable) {
      return;
    }

    if(!this.columns.length) {
      return;
    }

    this._dragAndDrop.closestColumn = this._getClosestColumn(e);

    if(!this._dragAndDrop.closestColumn) {
      return;
    }

    let offset = DomUtils.offset(this._dragAndDrop.closestColumn);
    if(!offset) {
      return;
    }

    this._dragAndDrop.oldDropSide = this._dragAndDrop.dropSide;

    // sets the drop side, e.g. (dragging Age column, ^ is the cursor position)
    // First Name | Last Name | Age
    //         ^                    ("right")
    // First Name | Last Name | Age
    //  ^                           ("left")
    this._dragAndDrop.dropSide = e.pageX < offset.left + (this._dragAndDrop.closestColumn.offsetWidth / 2) ? 'left' : 'right';

    if(this._dragAndDrop.dropSide && this._dragAndDrop.oldDropSide !== this._dragAndDrop.dropSide) {
      this._clearMarkers();
      this._insertMarker();
    }
  }

  private _onDropped(e, el, column: Column) {
    if(!column.other.groupable) {
      return;
    }

    this._dragAndDrop.overDroppable = false;

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
      this._getSortingBucket().addColumn(column);
    }

    if(!this.columns.length) {
      this._setColumns([{column: column}]);
      this._gridInternals.refresh();
      return;
    }

    let closest = this._gridOptions.getColumnByElement(this._dragAndDrop.closestColumn);
    let newColumns: Column[] = [];
    for (let c of this.columns) {
      if(c === closest && this._dragAndDrop.dropSide === 'left') {
        newColumns.push(column);
      }

      if(c !== column) {
        newColumns.push(c);
      }

      if(c === closest && this._dragAndDrop.dropSide === 'right') {
        newColumns.push(column);
      }
    }

    this._setColumns(newColumns.map(x => { return {column: x} }));
    this._gridInternals.refresh();
  }

  private _setColumns(columns: IColumnWithSorting[]) {
    this.columns = columns.map(x => x.column);
    
    let sorting = this._getSortingBucket();
    let order = 0;
    columns.forEach(x => {
      x.column.setOwner(GroupingComponent);
      sorting.sortBy(x.column, order++, x.direction);
    });
  }

  private _getSortingBucket(): SortingBucket {
    return this._components.get(SortingComponent)
      .instance.getBucketByOwner(GroupingComponent);
  }

  private _clearMarkers() {
    for (let marker of this._dragAndDrop.markers) {
      marker.parentNode.removeChild(marker);
    }
    this._dragAndDrop.markers = [];
  }

  private _insertMarker() {
    let div = document.createElement('div');
    if(this._dragAndDrop.dropSide === 'left') {
      div.setAttribute('class', 'm-grid-marker m-grid-left-marker');
      this._dragAndDrop.closestColumn.appendChild(div);
    }
    if(this._dragAndDrop.dropSide === 'right') {
      div.setAttribute('class', 'm-grid-marker m-grid-right-marker');
      this._dragAndDrop.closestColumn.insertBefore(div, this._dragAndDrop.closestColumn.firstChild);
    }
    this._dragAndDrop.markers.push(div);
  }

  private _clear() {
    this._clearMarkers();
    this._dragAndDrop.closestColumn = undefined;
    this._dragAndDrop.dropSide = undefined;
    this._dragAndDrop.overDroppable = false;
  }

  private _getClosestColumn(e) {
    let closest;
    let distance = Infinity;
    for (let column of this._dragAndDrop.columns) {
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

  private _listenOnColumnOwnerChanged() {
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
      this._getSortingBucket().removeColumn(msg.column);

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

interface IColumnWithSorting {
  column: Column,
  direction?: string
}

export interface IGroupingState {
  columns: IGroupingColumnState[] 
}

export interface IGroupingColumnState {
  id: string,
  direction: string
}