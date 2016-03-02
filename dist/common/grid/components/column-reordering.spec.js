System.register(['../../unitTesting/grid/base', './column-reordering', 'marvelous-aurelia-core/utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var base_1, column_reordering_1, utils_1;
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (column_reordering_1_1) {
                column_reordering_1 = column_reordering_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            describe('Column reordering component', function () {
                var h;
                var gridOptions;
                var getComponent = function (codeBased, domBased) {
                    if (codeBased === void 0) { codeBased = { columnReordering: true }; }
                    if (domBased === void 0) { domBased = ""; }
                    gridOptions = h.getGridOptions(codeBased, domBased + "<columns><column field=\"FirstName\"></column><column field=\"LastName\"></column><column field=\"Age\"></column></column><column field=\"DateOfBirth\"></column></columns>");
                    var subject = new column_reordering_1.ColumnReorderingComponent(gridOptions, h.gridInternals);
                    subject.tryEnable();
                    return subject;
                };
                beforeEach(function () {
                    h = new base_1.GridTestHelpers();
                    h.beforeEach();
                });
                describe('should react on columns drag and drop', function () {
                    var columns;
                    var component;
                    var htmlColumns;
                    var isCursorOverElement;
                    beforeEach(function () {
                        component = getComponent();
                        columns = {
                            firstName: h.getColumn({ field: 'FirstName' }),
                            lastName: h.getColumn({ field: 'LastName' }),
                            age: h.getColumn({ field: 'Age' })
                        };
                        htmlColumns = {
                            firstName: {
                                _column: columns.firstName,
                                clientWidth: 100,
                                offset: {
                                    left: 50,
                                    top: 10
                                },
                                insertBefore: sinon.spy(),
                                appendChild: sinon.spy()
                            },
                            lastName: {
                                _column: columns.lastName,
                                clientWidth: 200,
                                offset: {
                                    left: 150,
                                    top: 10
                                },
                                insertBefore: sinon.spy(),
                                appendChild: sinon.spy()
                            },
                            age: {
                                _column: columns.age,
                                clientWidth: 50,
                                offset: {
                                    left: 350,
                                    top: 10
                                },
                                insertBefore: sinon.spy(),
                                appendChild: sinon.spy()
                            }
                        };
                        h.gridInternals.element.querySelectorAll = function () {
                            return [htmlColumns.firstName, htmlColumns.lastName, htmlColumns.age];
                        };
                        isCursorOverElement = utils_1.DomUtils.isCursorOverElement = sinon.stub();
                        gridOptions.getColumnByElement = function (el) { return el._column; };
                    });
                    it('moved should clear if position not changed', function () {
                        var event = { pageX: 100 };
                        var el = htmlColumns.firstName;
                        isCursorOverElement.withArgs(el, event).returns(true);
                        component.markers = [document.createElement('div')];
                        component.hoveredColumn = htmlColumns.lastName;
                        component.side = 'left';
                        h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
                        expect(component.markers.length).toBe(0);
                        expect(component.hoveredColumn).toBeFalsy();
                        expect(component.side).toBeFalsy();
                    });
                    it('moved should do nothing if not hovered on any column', function () {
                        var event = { pageX: 100 };
                        var el = htmlColumns.firstName;
                        isCursorOverElement.returns(false);
                        expect(component.oldSide).toBeFalsy();
                        component.side = 'left';
                        h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
                        expect(component.oldSide).toBeFalsy();
                    });
                    it('moved should calculate left side correctly', function () {
                        var event = { pageX: 160 };
                        var el = htmlColumns.firstName;
                        isCursorOverElement.returns(false);
                        isCursorOverElement.withArgs(htmlColumns.lastName, event).returns(true);
                        utils_1.DomUtils.offset = sinon.stub().withArgs(htmlColumns.lastName).returns(htmlColumns.lastName.offset);
                        h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
                        expect(component.side).toBe('left');
                        expect(component.markers.length).toBe(1);
                    });
                    it('moved should calculate right side correctly', function () {
                        var event = { pageX: 270 };
                        var el = htmlColumns.firstName;
                        isCursorOverElement.returns(false);
                        isCursorOverElement.withArgs(htmlColumns.lastName, event).returns(true);
                        utils_1.DomUtils.offset = sinon.stub().withArgs(htmlColumns.lastName).returns(htmlColumns.lastName.offset);
                        h.gridInternals.listenOnDragAndDrop.moved(event, el, columns.firstName);
                        expect(component.side).toBe('right');
                        expect(component.markers.length).toBe(1);
                    });
                    it('dropped should work properly in valid cases', function () {
                        var test = function (input, newColumns) {
                            component.hoveredColumn = input.hovered;
                            component.side = input.side;
                            h.gridInternals.mainColumns = input.columns.map(function (x) { return x._column; });
                            h.gridInternals.element.querySelectorAll = function () { return input.columns; };
                            h.gridInternals.listenOnDragAndDrop.dropped(undefined, input.dragged, input.dragged._column);
                            expect(h.gridInternals.mainColumns).toEqual(newColumns);
                        };
                        // age
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.age,
                            side: 'left'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.age,
                            side: 'right'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.lastName,
                            side: 'left'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.lastName,
                            side: 'right'
                        }, [columns.lastName, columns.age, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.firstName,
                            side: 'left'
                        }, [columns.lastName, columns.age, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.age,
                            hovered: htmlColumns.firstName,
                            side: 'right'
                        }, [columns.lastName, columns.firstName, columns.age]);
                        // last name
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.age,
                            side: 'left'
                        }, [columns.lastName, columns.age, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.age,
                            side: 'right'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.lastName,
                            side: 'left'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.lastName,
                            side: 'right'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.firstName,
                            side: 'left'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.lastName,
                            hovered: htmlColumns.firstName,
                            side: 'right'
                        }, [columns.age, columns.firstName, columns.lastName]);
                        // first name
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.age,
                            side: 'left'
                        }, [columns.firstName, columns.age, columns.lastName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.age,
                            side: 'right'
                        }, [columns.age, columns.firstName, columns.lastName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.lastName,
                            side: 'left'
                        }, [columns.age, columns.firstName, columns.lastName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.lastName,
                            side: 'right'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.firstName,
                            side: 'left'
                        }, [columns.age, columns.lastName, columns.firstName]);
                        test({
                            columns: [htmlColumns.age, htmlColumns.lastName, htmlColumns.firstName],
                            dragged: htmlColumns.firstName,
                            hovered: htmlColumns.firstName,
                            side: 'right'
                        }, [columns.age, columns.lastName, columns.firstName]);
                    });
                });
                describe('should be able to create options', function () {
                    it('from code based settings', function () {
                        var component = getComponent({ columnReordering: true }, "");
                        expect(component.options).toBeTruthy();
                    });
                    it('from DOM based settings', function () {
                        var component = getComponent({}, "<column-reordering></column-reordering>");
                        expect(component.options).toBeTruthy();
                    });
                    it('when configuration is not available', function () {
                        var component = getComponent({}, "");
                        expect(component.options).toBeFalsy();
                    });
                });
            });
        }
    }
});
