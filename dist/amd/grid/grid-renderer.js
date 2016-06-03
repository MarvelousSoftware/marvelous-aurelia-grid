var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'aurelia-dependency-injection', './components/grouping', 'marvelous-aurelia-core/compiler', 'marvelous-aurelia-core/utils'], function (require, exports, aurelia_dependency_injection_1, grouping_1, compiler_1, utils_1) {
    "use strict";
    var GridRenderer = (function () {
        function GridRenderer(compiler) {
            this.compiler = compiler;
        }
        GridRenderer.prototype.init = function (grid) {
            this.grid = grid;
        };
        GridRenderer.prototype.render = function () {
            this.rows = this.createRows();
            if (!this.groups) {
                return;
            }
            if (this.tableDataViewFactory) {
                // If this method shall refresh already existing instance
                // then previously created view has to be unbinded.
                // Otherwise it would cause memory leak and probably some
                // erorrs.
                this.tableDataViewFactory.unbind();
            }
            var tbody = this.grid.internals.element.querySelector("table>tbody");
            utils_1.DomUtils.clearInnerHtml(tbody);
            // Fix for FF bug.
            // Firefox does not display borders if tbody is empty
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1023761
            var emptyRowTemplate = document.createElement("tr");
            emptyRowTemplate.setAttribute("if.bind", "renderer.rows.length === 0");
            var rowTemplate = document.createElement("tr");
            rowTemplate.setAttribute("repeat.for", "$row of renderer.rows");
            rowTemplate.setAttribute("class", "${$row.classes}");
            rowTemplate.setAttribute("click.trigger", "$row.grid.internals.publish('RowClick', {row: $row, nativeEvent: $event})");
            if (this.groups.length) {
                var td = document.createElement("td");
                td.setAttribute("if.bind", "$row.type === 'data'");
                td.setAttribute("class", "m-grid-group-margin");
                td.setAttribute("colspan", this.groups.length.toString());
                rowTemplate.appendChild(td);
            }
            this.grid.internals.mainColumns.forEach(function (c) {
                var td = document.createElement("td");
                td.setAttribute("if.bind", "$row.type === 'data'");
                if (c.template === '')
                    td.innerHTML = '${ $row.data.' + c.field + ' }';
                else
                    td.innerHTML = c.template;
                rowTemplate.appendChild(td);
            });
            if (this.groups.length) {
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
        };
        GridRenderer.prototype.createRows = function () {
            var _this = this;
            this.groups = this.grid.components.get(grouping_1.GroupingComponent).instance.columns;
            if (!this.groups || !this.groups.length) {
                this.groups = [];
            }
            var lvl = 0;
            var rows = [];
            var prevRow;
            if (!this.grid.dataSource.result) {
                return rows;
            }
            this.grid.dataSource.result.data.forEach(function (x) {
                for (var i = 0; i < _this.groups.length; i++) {
                    var groupedColumn = _this.groups[i];
                    if (prevRow && prevRow.data[groupedColumn.field] === x[groupedColumn.field]) {
                        // if still same value in the grouping then just move on
                        continue;
                    }
                    lvl = i;
                    var row_1 = new DataRow({
                        grid: _this.grid,
                        type: exports.rowTypes.group,
                        column: groupedColumn,
                        value: x[groupedColumn.field],
                        level: lvl
                    });
                    row_1.addClass('m-grid-group-row');
                    rows.push(row_1);
                }
                if (prevRow && prevRow.type === 'group') {
                    // since previous row is a group then indention level needs to increase
                    lvl++;
                }
                var row = new DataRow({
                    grid: _this.grid,
                    type: exports.rowTypes.data,
                    data: x,
                    level: lvl
                });
                row.addClass('m-grid-data-row');
                rows.push(row);
                prevRow = row;
            });
            return rows;
        };
        GridRenderer = __decorate([
            aurelia_dependency_injection_1.transient(),
            aurelia_dependency_injection_1.inject(compiler_1.Compiler)
        ], GridRenderer);
        return GridRenderer;
    }());
    exports.GridRenderer = GridRenderer;
    exports.rowTypes = {
        group: 'group',
        data: 'data'
    };
    var DataRow = (function () {
        function DataRow(row) {
            this.grid = undefined;
            this.type = undefined;
            this.column = undefined;
            this.value = undefined;
            this.level = undefined;
            this.data = undefined;
            this.classes = '';
            for (var key in row) {
                this[key] = row[key];
            }
        }
        DataRow.prototype.addClass = function (name) {
            if (this.hasClass(name)) {
                return;
            }
            this.classes += ' ' + name;
        };
        DataRow.prototype.removeClass = function (name) {
            if (!this.hasClass(name)) {
                return;
            }
            this.classes = this.classes.replace(' ' + name, '');
            this.classes = this.classes.replace(name, '');
        };
        DataRow.prototype.hasClass = function (name) {
            if (this.classes !== undefined && this.classes.indexOf(name) !== -1) {
                return true;
            }
            return false;
        };
        return DataRow;
    }());
    exports.DataRow = DataRow;
});
