import {inject, transient} from 'aurelia-dependency-injection';
import {GroupingComponent, IDataRow, Grid, Column} from './all';
import {Compiler} from 'marvelous-aurelia-core/compiler';
import {DomUtils} from 'marvelous-aurelia-core/utils';

@transient()
@inject(Compiler)
export class GridRenderer {
  rows: IDataRow[];
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
    rowTemplate.setAttribute("class", "${$row.type === 'group' ? 'm-grid-group-row' : 'm-grid-data-row'}");

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
    let rows: IDataRow[] = [];
    let prevRow: IDataRow;

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

        rows.push({
          grid: this.grid,
          type: 'group',
          column: groupedColumn,
          value: x[groupedColumn.field],
          level: lvl
        });
      }

      if(prevRow && prevRow.type === 'group') {
        // since previous row is a group then indention level needs to increase
        lvl++;
      }

      let row = {
        grid: this.grid,
        type: 'data',
        data: x,
        level: lvl
      };
      rows.push(row);
      prevRow = row;
    });

    return rows;
  }
}

export interface IDataRow {
  grid: Grid,
  type: string,
  column?: Column,
  value?: any,
  level: Number,
  data?: any
}