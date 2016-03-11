import {inject, transient} from 'aurelia-dependency-injection';
import {Column} from './models/column';
import {Grid} from './grid';
import {GroupingComponent} from './components/grouping';
import {Compiler} from 'marvelous-aurelia-core/compiler';
import {DomUtils} from 'marvelous-aurelia-core/utils';

@transient()
@inject(Compiler)
export class GridRenderer {
  rows: DataRow[];
  groups: any[];
  tableDataViewFactory;
  
  grid: Grid;
  compiler: Compiler;
  
  constructor(compiler: Compiler) {
    this.compiler = compiler;
  }
  
  init(grid: Grid) {
    this.grid = grid;
  }
  
  render() {
    this.rows = this.createRows();
    
    if(!this.groups) {
      return;
    }

    if(this.tableDataViewFactory) {
      // If this method shall refresh already existing instance
      // then previously created view has to be unbinded.
      // Otherwise it would cause memory leak and probably some
      // erorrs.
      this.tableDataViewFactory.unbind();
    }

    var tbody: any = this.grid.internals.element.querySelector("table>tbody");
    DomUtils.clearInnerHtml(tbody);

    // Fix for FF bug.
    // Firefox does not display borders if tbody is empty
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1023761
    var emptyRowTemplate = document.createElement("tr"); 
    emptyRowTemplate.setAttribute("if.bind", "renderer.rows.length === 0");

    var rowTemplate = document.createElement("tr");
		rowTemplate.setAttribute("repeat.for", "$row of renderer.rows");
    rowTemplate.setAttribute("class", "${$row.classes}");
    rowTemplate.setAttribute("click.trigger", "$row.grid.internals.publish('RowClick', {row: $row, nativeEvent: $event})")    
    
    if(this.groups.length) {
      var td = document.createElement("td");
      td.setAttribute("if.bind", "$row.type === 'data'");
      td.setAttribute("class", "m-grid-group-margin");
      td.setAttribute("colspan", this.groups.length.toString());
      rowTemplate.appendChild(td);
    }

		this.grid.internals.mainColumns.forEach(c => {
			var td = document.createElement("td");
      td.setAttribute("if.bind", "$row.type === 'data'");

      if(c.template === '')
        td.innerHTML = '${ $row.data.' + c.field + ' }';
      else
        td.innerHTML = c.template;

			rowTemplate.appendChild(td);
		});

    if(this.groups.length) {
      var td = document.createElement("td");
      td.setAttribute("if.bind", "$row.type === 'group' && $row.level > 0");
      td.setAttribute("class", "m-grid-group-margin");
      td.setAttribute("colspan.bind", "$row.level+1");
      rowTemplate.appendChild(td);
    }

    var td = document.createElement("td");
    td.setAttribute("if.bind", "$row.type === 'group'");
    td.setAttribute("colspan.bind", "$row.grid.internals.mainColumns.length + $row.grid.renderer.groups.length - $row.level");
    td.innerHTML = '${$row.column.heading}: <span class="m-grid-group-title">${$row.value}</span>';
    rowTemplate.appendChild(td);

    var fragment = document.createDocumentFragment();
    fragment.appendChild(emptyRowTemplate);
    fragment.appendChild(rowTemplate);
		this.tableDataViewFactory = this.compiler.compile(tbody, fragment, this.grid, this.grid.viewModel);
  }
  
  private createRows() {
    this.groups = this.grid.components.get(GroupingComponent).instance.columns;
    if(!this.groups || !this.groups.length) {
      this.groups = [];
    }

    let lvl = 0;
    let rows: DataRow[] = [];
    let prevRow: DataRow;

    if(!this.grid.dataSource.result) {
      return rows;
    }
    
    this.grid.dataSource.result.data.forEach(x => {
      for (var i = 0; i < this.groups.length; i++) {
        let groupedColumn = this.groups[i];

        if (prevRow && prevRow.data[groupedColumn.field] === x[groupedColumn.field]) {
          // if still same value in the grouping then just move on
          continue;
        }

        lvl = i;
        
        let row = new DataRow({
          grid: this.grid,
          type: rowTypes.group,
          column: groupedColumn,
          value: x[groupedColumn.field],
          level: lvl
        });
        row.addClass('m-grid-group-row');
        rows.push(row);
      }

      if(prevRow && prevRow.type === 'group') {
        // since previous row is a group then indention level needs to increase
        lvl++;
      }

      let row = new DataRow({
        grid: this.grid,
        type: rowTypes.data,
        data: x,
        level: lvl
      });
      row.addClass('m-grid-data-row')
      rows.push(row);
      prevRow = row;
    });

    return rows;
  }
}

export let rowTypes = {
  group: 'group',
  data: 'data'
}

export interface IDataRow {
  grid: Grid,
  type: string,
  column?: Column,
  value?: any,
  level: Number,
  data?: any
}

export class DataRow implements IDataRow {
  grid: Grid = undefined;
  type: string  = undefined;
  column: Column = undefined;
  value: any = undefined;
  level: Number = undefined;
  data: any = undefined;
  
  classes: string = '';
  
  constructor(row: IDataRow) {
    for(let key in row) {
      this[key] = row[key];
    }
  }
  
  addClass(name) {
    if(this.hasClass(name)) {
      return;
    }

    this.classes += ' ' + name;
  }

  removeClass(name) {
    if(!this.hasClass(name)) {
      return;
    }

    this.classes = this.classes.replace(' ' + name, '');
    this.classes = this.classes.replace(name, '');
  }

  hasClass(name) {
    if(this.classes !== undefined && this.classes.indexOf(name) !== -1) {
      return true;
    }
    return false;
  }
}

export interface IRowClickEvent {
  nativeEvent: MouseEvent;
  row: DataRow;
}