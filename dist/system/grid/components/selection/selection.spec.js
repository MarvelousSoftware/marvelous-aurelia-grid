System.register(['../../../unitTesting/grid/base', './selection', '../../grid-renderer'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var base_1, selection_1, grid_renderer_1;
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (selection_1_1) {
                selection_1 = selection_1_1;
            },
            function (grid_renderer_1_1) {
                grid_renderer_1 = grid_renderer_1_1;
            }],
        execute: function() {
            describe('FilterRow component', function () {
                var h;
                var click1;
                var click2;
                var getComponent = function (codeBased, domBased) {
                    var gridOptions = h.getGridOptions(codeBased, domBased + "<columns><column field=\"Name\"></column></columns>");
                    var subject = new selection_1.SelectionComponent(h.gridInternals, gridOptions, h.dataSource);
                    subject.tryEnable();
                    return subject;
                };
                beforeEach(function () {
                    h = new base_1.GridTestHelpers();
                    h.beforeEach();
                    h.gridInternals.renderer.rows = [new grid_renderer_1.DataRow({
                            column: undefined,
                            data: { firstName: 'John' },
                            grid: undefined,
                            level: 0,
                            type: grid_renderer_1.rowTypes.data
                        }), new grid_renderer_1.DataRow({
                            column: undefined,
                            data: { firstName: 'Jane' },
                            grid: undefined,
                            level: 0,
                            type: grid_renderer_1.rowTypes.data
                        })];
                    click1 = {
                        row: h.gridInternals.renderer.rows[0],
                        nativeEvent: undefined
                    };
                    click2 = {
                        row: h.gridInternals.renderer.rows[1],
                        nativeEvent: undefined
                    };
                });
                describe('should react on row click', function () {
                    it('should do nothing if row is not of data type', function () {
                        var selection = getComponent({}, "<selection></selection>");
                        var rowData = { firstName: 'John' };
                        var click = {
                            row: new grid_renderer_1.DataRow({
                                column: undefined,
                                data: rowData,
                                grid: undefined,
                                level: 0,
                                type: grid_renderer_1.rowTypes.group
                            }),
                            nativeEvent: undefined
                        };
                        h.gridInternals.subscribe.emit('RowClick', click);
                        expect(selection.selectedItems.length).toBe(0);
                    });
                    it('should be able to select single', function () {
                        var selection = getComponent({}, "<selection></selection>");
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        h.gridInternals.subscribe.emit('RowClick', click2);
                        expect(selection.selectedItems.length).toBe(1);
                        expect(selection.selectedItems[0]).toBe(click2.row.data);
                        expect(click1.row.hasClass('m-row-selected')).toBe(false);
                        expect(click2.row.hasClass('m-row-selected')).toBe(true);
                    });
                    it('should be able to select multiple', function () {
                        var selection = getComponent({}, "<selection multiple></selection>");
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        h.gridInternals.subscribe.emit('RowClick', click2);
                        expect(selection.selectedItems.length).toBe(2);
                        expect(selection.selectedItems[0]).toBe(click1.row.data);
                        expect(selection.selectedItems[1]).toBe(click2.row.data);
                        expect(click1.row.hasClass('m-row-selected')).toBe(true);
                        expect(click2.row.hasClass('m-row-selected')).toBe(true);
                    });
                    it('should be able to deselect', function () {
                        var selection = getComponent({}, "<selection multiple></selection>");
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        h.gridInternals.subscribe.emit('RowClick', click2);
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        expect(selection.selectedItems.length).toBe(1);
                        expect(selection.selectedItems[0]).toBe(click2.row.data);
                        expect(click1.row.hasClass('m-row-selected')).toBe(false);
                        expect(click2.row.hasClass('m-row-selected')).toBe(true);
                    });
                    it('should be able to work even when one is messing with selectedItems', function () {
                        var selection = getComponent({}, "<selection multiple></selection>");
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        selection.selectedItems.splice(0);
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        expect(selection.selectedItems.length).toBe(0);
                        expect(click1.row.hasClass('m-row-selected')).toBe(false);
                    });
                });
                describe('should react on data read', function () {
                    it('by clearing selection', function () {
                        var selection = getComponent({}, "<selection></selection>");
                        h.gridInternals.subscribe.emit('RowClick', click1);
                        h.dataSource.subscribe.emit('DataRead', {});
                        expect(selection.selectedItems.length).toBe(0);
                    });
                });
                describe('should be able to create options', function () {
                    it('from DOM based settings', function () {
                        var selection = getComponent({}, "<selection></selection>");
                        expect(selection.options).toBeTruthy();
                        expect(selection.options.multiple).toBe(false);
                        selection = getComponent({}, "<selection multiple></selection>");
                        expect(selection.options).toBeTruthy();
                        expect(selection.options.multiple).toBe(true);
                        selection = getComponent({}, "<test></test>");
                        expect(selection.options).toBeFalsy();
                    });
                    it('from code based settings', function () {
                        var selection = getComponent({ selection: true }, "");
                        expect(selection.options).toBeTruthy();
                        expect(selection.options.multiple).toBe(false);
                        selection = getComponent({ selection: { multiple: true } }, "");
                        expect(selection.options).toBeTruthy();
                        expect(selection.options.multiple).toBe(true);
                        selection = getComponent({ test: true }, "");
                        expect(selection.options).toBeFalsy();
                    });
                });
            });
        }
    }
});
