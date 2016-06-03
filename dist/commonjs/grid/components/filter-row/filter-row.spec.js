"use strict";
var base_1 = require('../../../unitTesting/grid/base');
var filter_row_1 = require('./filter-row');
describe('FilterRow component', function () {
    var h;
    var column;
    var getComponent = function (codeBased, domBased) {
        var gridOptions = h.getGridOptions(codeBased, domBased + "<columns><column field=\"Name\"></column></columns>");
        var subject = new filter_row_1.FilterRowComponent(h.dataSource, h.aureliaUtils, h.gridInternals, gridOptions, column);
        subject.tryEnable();
        return subject;
    };
    var spyOnRefresh = function (action) {
        var initial = filter_row_1.FilterRowComponent.prototype.refresh;
        var spy = filter_row_1.FilterRowComponent.prototype.refresh = sinon.spy();
        action(spy);
        filter_row_1.FilterRowComponent.prototype.refresh = initial;
    };
    var textRequiredOperator = {
        name: 'Foo',
        textRequired: true,
        value: 'foo'
    };
    var textNotRequiredOperator = {
        name: 'Bar',
        textRequired: false,
        value: 'bar'
    };
    beforeEach(function () {
        h = new base_1.GridTestHelpers();
        h.beforeEach();
        column = h.getColumn({
            field: 'Name',
            heading: 'Name',
            template: ''
        });
    });
    describe('should be able to create options', function () {
        it('from DOM based settings', function () {
            var filterRow = getComponent({}, "<filter-row></filter-row>");
            expect(filterRow.options).toBeTruthy();
        });
        it('from code based settings', function () {
            var filterRow = getComponent({ filterRow: true }, "");
            expect(filterRow.options).toBeTruthy();
        });
        it('when configuration is not available', function () {
            var filterRow = getComponent({}, "");
            expect(filterRow.options).toBeFalsy();
        });
        it('when column is explicitly disabled', function () {
            column = h.getColumn((_a = {}, _a['row-filtering-disabled'] = 'true', _a.field = 'foo', _a));
            var filterRow = getComponent({ filterRow: true }, "");
            expect(filterRow.options).toBeFalsy();
            var _a;
        });
        it('when column does not have field configured', function () {
            column = h.getColumn({});
            var filterRow = getComponent({ filterRow: true }, "");
            expect(filterRow.options).toBeFalsy();
        });
    });
    it('should unregister correctly', function () {
        var subject = getComponent({ filterRow: true }, "");
        subject.stop();
        expect(h.dataSource.subscribe.subscribers.length).toBe(0);
        expect(h.aureliaUtils.observe.observers.length).toBe(0);
    });
    describe('saveState method should', function () {
        it('save state if compare operator is selected', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = subject.allCompareOperators['Equal'];
            var state = {};
            subject.saveState(state);
            expect(state[column.getUniqueId()].selectedCompareOperator)
                .toEqual(subject.selectedCompareOperator);
        });
        it('save state if compare text is provided', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.compareText = 'Foo';
            var state = {};
            subject.saveState(state);
            expect(state[column.getUniqueId()].compareText)
                .toEqual(subject.compareText);
        });
        it('do nothing if input data is missing', function () {
            var subject = getComponent({ filterRow: true }, "");
            var state = {};
            subject.saveState(state);
            expect(state).toEqual({});
        });
    });
    describe('loadState method should', function () {
        it('load saved selected compare operator', function () {
            var subject = getComponent({ filterRow: true }, "");
            var state = (_a = {},
                _a[column.getUniqueId()] = {
                    selectedCompareOperator: subject.allCompareOperators['Equal']
                },
                _a
            );
            subject.loadState(state);
            expect(subject.selectedCompareOperator).toEqual(subject.allCompareOperators['Equal']);
            var _a;
        });
        it('load saved compare text', function () {
            var subject = getComponent({ filterRow: true }, "");
            var text = 'Foo';
            var state = (_a = {},
                _a[column.getUniqueId()] = {
                    compareText: text
                },
                _a
            );
            subject.loadState(state);
            expect(subject.compareText).toEqual(text);
            var _a;
        });
        it('do nothing if state is to defined for given column', function () {
            var subject = getComponent({ filterRow: true }, "");
            var state = {};
            var initialText = subject.compareText;
            var initialOperator = subject.selectedCompareOperator;
            subject.loadState(state);
            expect(subject.compareText).toBe(initialText);
            expect(subject.selectedCompareOperator).toBe(initialOperator);
        });
    });
    describe('selectCompareOperator method should', function () {
        it('should change selected compare operator if given is available', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.compareOperators = [textNotRequiredOperator];
            subject.selectCompareOperator('Bar');
            expect(subject.selectedCompareOperator).toBe(subject.compareOperators[0]);
        });
        it('do nothing if compare operator is not available', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.compareOperators = [];
            var initialOperator = subject.selectedCompareOperator;
            subject.selectCompareOperator('Foo');
            expect(subject.selectedCompareOperator).toBe(initialOperator);
        });
    });
    describe('on data read should', function () {
        it('do nothing if compare operator not selected', function () {
            var subject = getComponent({ filterRow: true }, "");
            var params = {};
            h.dataSource.subscribe.emit('DataRead', params);
            expect(params.filtering).toBeFalsy();
        });
        it('do nothing if compare text is empty when required', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textRequiredOperator;
            var params = {};
            h.dataSource.subscribe.emit('DataRead', params);
            expect(params.filtering).toBeFalsy();
        });
        it('attach filtering', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectCompareOperator('Equal');
            subject.compareText = 'bar';
            var params = {};
            h.dataSource.subscribe.emit('DataRead', params);
            expect(params.filtering).toBeTruthy();
            expect(params.filtering[column.field]).toBeTruthy();
            expect(params.filtering[column.field]).toEqual([{
                    compareOperator: subject.selectedCompareOperator.name,
                    value: subject.compareText
                }]);
        });
        it('attach column to existing filtering configuration', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectCompareOperator('Equal');
            subject.compareText = 'bar';
            var params = {
                filtering: (_a = {},
                    _a[column.field] = [{
                            compareOperator: 'FOO',
                            value: 'BAR'
                        }],
                    _a
                )
            };
            h.dataSource.subscribe.emit('DataRead', params);
            expect(params.filtering).toBeTruthy();
            expect(params.filtering[column.field]).toBeTruthy();
            expect(params.filtering[column.field].length).toBe(2);
            expect(params.filtering[column.field]).toContain({
                compareOperator: subject.selectedCompareOperator.name,
                value: subject.compareText
            });
            var _a;
        });
    });
    describe('refresh method should', function () {
        it('do nothing if text required and not found', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textRequiredOperator;
            subject.refresh();
            expect(h.gridInternals.refresh.called).toBe(false);
        });
        it('refresh grid if text required and found', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textRequiredOperator;
            subject.compareText = 'bar';
            subject.refresh();
            expect(h.gridInternals.refresh.calledOnce).toBe(true);
        });
        it('refresh grid if text not required and not found', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textNotRequiredOperator;
            subject.refresh();
            expect(h.gridInternals.refresh.calledOnce).toBe(true);
        });
        it('refresh grid only once if selected compare operator not changed and text not required', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textNotRequiredOperator;
            subject.refresh();
            subject.refresh();
            subject.refresh();
            expect(h.gridInternals.refresh.calledOnce).toBe(true);
        });
        it('refresh grid twice if selected compare operator has changed and text not required', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textNotRequiredOperator;
            subject.refresh();
            subject.selectedCompareOperator = {
                name: 'Foobar',
                textRequired: false,
                value: 'foobar'
            };
            subject.refresh();
            subject.refresh();
            expect(h.gridInternals.refresh.calledTwice).toBe(true);
        });
        it('refresh grid only once if selected compare operator and text not changed in case when text is required', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textRequiredOperator;
            subject.compareText = 'bar';
            subject.refresh();
            subject.refresh();
            subject.refresh();
            expect(h.gridInternals.refresh.calledOnce).toBe(true);
        });
        it('refresh grid twice if selected compare operator not changed but text changed in case when text is required', function () {
            var subject = getComponent({ filterRow: true }, "");
            subject.selectedCompareOperator = textRequiredOperator;
            subject.compareText = 'bar';
            subject.refresh();
            subject.compareText = 'bar2';
            subject.refresh();
            subject.refresh();
            expect(h.gridInternals.refresh.calledTwice).toBe(true);
        });
    });
    describe('on selected compare operator changed should', function () {
        it('do nothing on first call', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', null, undefined);
                expect(spy.called).toBe(false);
            });
        });
        it('do nothing if text required and missing', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                subject.selectedCompareOperator = textRequiredOperator;
                h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
                expect(spy.called).toBe(false);
            });
        });
        it('refresh grid if text required and found', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                subject.selectedCompareOperator = textRequiredOperator;
                subject.compareText = 'BAR';
                h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
                expect(spy.calledOnce).toBe(true);
            });
        });
        it('refresh grid if text not required', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                subject.selectedCompareOperator = textNotRequiredOperator;
                h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', subject.selectedCompareOperator, null);
                expect(spy.calledOnce).toBe(true);
            });
        });
        it('clear compare text on operator unselected', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                subject.selectedCompareOperator = textRequiredOperator;
                subject.compareText = 'BAR';
                h.aureliaUtils.observe.emit(subject, 'selectedCompareOperator', '', subject.selectedCompareOperator);
                expect(spy.calledOnce).toBe(true);
                expect(subject.compareText).toBeFalsy();
            });
        });
    });
    describe('constructor should', function () {
        describe('should create valid type', function () {
            it('when defined', function () {
                column = h.getColumn({ type: 'number', field: 'foo' });
                var subject = getComponent({ filterRow: true }, "");
                expect(subject.type).toEqual('number');
            });
            it('when not defined', function () {
                var subject = getComponent({ filterRow: true }, "");
                expect(subject.type).toEqual('string');
            });
        });
        it('detect not nullable type', function () {
            column = h.getColumn({ nullable: 'false', field: 'foo' });
            var subject = getComponent({ filterRow: true }, "");
            expect(subject.nullable).toBe(false);
        });
        it('consider type as nullable if not specified otherwise', function () {
            var subject = getComponent({ filterRow: true }, "");
            expect(subject.nullable).toBe(true);
        });
        it('should initialize compare operators', function () {
            column = h.getColumn({ nullable: 'false', type: 'number', field: 'foo' });
            var initial = filter_row_1.FilterRowComponent.prototype._getCompareOperators;
            var spy = filter_row_1.FilterRowComponent.prototype._getCompareOperators = sinon.spy();
            var subject = getComponent({ filterRow: true }, "");
            expect(spy.calledOnce).toBe(true);
            expect(spy.calledWith(subject.type, subject.nullable)).toBe(true);
            filter_row_1.FilterRowComponent.prototype._getCompareOperators = initial;
        });
    });
    describe('getCompareOperators method should', function () {
        it('handle all supported types', function () {
            var subject = getComponent({ filterRow: true }, "");
            expect(subject._getCompareOperators('string', false).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('string', true).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('number', false).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('number', true).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('date', false).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('date', true).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('boolean', false).length).toBeGreaterThan(0);
            expect(subject._getCompareOperators('boolean', true).length).toBeGreaterThan(0);
        });
        it('should throw on not supported type', function () {
            var subject = getComponent({ filterRow: true }, "");
            expect(function () { subject._getCompareOperators('foo', false); }).toThrow();
        });
    });
    describe('onCompareTextWrite method should', function () {
        it('refresh on enter pressed', function () {
            spyOnRefresh(function (spy) {
                var subject = getComponent({ filterRow: true }, "");
                subject._onCompareTextWrite({ which: 13 });
                expect(spy.calledOnce).toBe(true);
            });
        });
    });
});
