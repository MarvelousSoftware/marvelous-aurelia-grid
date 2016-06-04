System.register(['../../../unitTesting/grid/base', './sorting', '../../constants'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var base_1, sorting_1, constants_1;
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (sorting_1_1) {
                sorting_1 = sorting_1_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            }],
        execute: function() {
            describe('Sorting', function () {
                function BucketOwner() { }
                var h;
                var columns;
                var getBucket = function (options) {
                    return new sorting_1.SortingBucket(options);
                };
                var getComponent = function (codeBased, domBased) {
                    var gridOptions = h.getGridOptions(codeBased, domBased + "<columns><column field=\"FirstName\"></column><column field=\"LastName\"></column><column field=\"Age\"></column></columns>");
                    gridOptions.columns = [columns.age, columns.firstName, columns.lastName];
                    var subject = new sorting_1.SortingComponent(gridOptions, h.gridInternals, h.dataSource);
                    subject.tryEnable();
                    return subject;
                };
                var mode = constants_1.sortingMode;
                beforeEach(function () {
                    h = new base_1.GridTestHelpers();
                    h.beforeEach();
                    columns = {
                        firstName: h.getColumn({
                            field: 'FirstName'
                        }),
                        lastName: h.getColumn({
                            field: 'LastName'
                        }),
                        age: h.getColumn({
                            field: 'Age'
                        })
                    };
                });
                describe('component', function () {
                    var component;
                    beforeEach(function () {
                        component = undefined;
                    });
                    describe('should start with', function () {
                        it('adding main bucket', function () {
                            component = getComponent({ sorting: true }, "");
                            expect(component.buckets.length).toBe(1);
                            expect(component.buckets[0].owner).toEqual(sorting_1.SortingComponent);
                            expect(component.buckets[0].order).toBe(0);
                        });
                    });
                    describe('should be able to save state', function () {
                        it("", function () {
                            var state = {};
                            component = getComponent({ sorting: { mode: mode.multiple } }, "");
                            var bucket = component.getBucketByOwner(sorting_1.SortingComponent);
                            bucket.sortBy(columns.firstName, 0, 'desc');
                            bucket.sortBy(columns.lastName, 1, 'asc');
                            component.saveState(state);
                            expect(state.columns).toEqual([{
                                    id: columns.firstName.getUniqueId(),
                                    direction: bucket.getSortingDirection(columns.firstName)
                                }, {
                                    id: columns.lastName.getUniqueId(),
                                    direction: bucket.getSortingDirection(columns.lastName)
                                }]);
                        });
                        it("and uses SortingComponent's bucket", function () {
                            var state = {};
                            component = getComponent({ sorting: true }, "");
                            var stub = sinon.stub(component, 'getBucketByOwner').returns({ columns: [] });
                            component.saveState(state);
                            expect(stub.calledOnce).toBe(true);
                            expect(stub.calledWithExactly(sorting_1.SortingComponent)).toBe(true);
                        });
                    });
                    describe('should be able to load state', function () {
                        it('', function () {
                            component = getComponent({ sorting: { mode: mode.multiple } }, "");
                            var bucket = component.getBucketByOwner(sorting_1.SortingComponent);
                            component.loadState({
                                columns: [{
                                        id: columns.lastName.getUniqueId(),
                                        direction: 'desc'
                                    }, {
                                        id: columns.age.getUniqueId(),
                                        direction: 'asc'
                                    }]
                            });
                            expect(bucket.getSortingDirection(columns.lastName)).toBe('desc');
                            expect(bucket.getSortingDirection(columns.age)).toBe('asc');
                            expect(columns.lastName.state.sortOrder).toBeLessThan(columns.age.state.sortOrder);
                            expect(h.gridInternals.refresh.calledOnce).toBe(true);
                        });
                        it('and work in case if provided state is empty', function () {
                            component = getComponent({ sorting: true }, "");
                            component.loadState({ columns: [] });
                            expect(h.gridInternals.refresh.called).toBe(false);
                            component.loadState({});
                            expect(h.gridInternals.refresh.called).toBe(false);
                            component.loadState(undefined);
                            expect(h.gridInternals.refresh.called).toBe(false);
                            component.loadState(null);
                            expect(h.gridInternals.refresh.called).toBe(false);
                        });
                    });
                    describe('should be able to create options', function () {
                        it('from code based settings', function () {
                            component = getComponent({ sorting: { mode: mode.multiple } }, "");
                            expect(component.options.mode).toBe(mode.multiple);
                            component = getComponent({ sorting: { mode: mode.single } }, "");
                            expect(component.options.mode).toBe(mode.single);
                        });
                        it('from code based settings', function () {
                            component = getComponent({}, "<sorting mode=\"multiple\"></sorting>");
                            expect(component.options.mode).toBe(mode.multiple);
                            component = getComponent({}, "<sorting mode=\"single\"></sorting>");
                            expect(component.options.mode).toBe(mode.single);
                        });
                        it('use default options as a fallback plan', function () {
                            component = getComponent({ sorting: true }, "");
                            expect(component.options.mode).toBe(component.defaultOptions.mode);
                        });
                        it('when configuration is not available', function () {
                            component = getComponent({}, "");
                            expect(component.options).toBeFalsy();
                        });
                    });
                    describe('on data read should', function () {
                        it('use all buckets to create params', function () {
                            var params = {};
                            component = getComponent({ sorting: true }, "");
                            var componentBucket = component.getBucketByOwner(sorting_1.SortingComponent);
                            componentBucket.sortBy(columns.age, 0, 'desc');
                            var customBucket = component.addBucket(BucketOwner, -1, {
                                alwaysSorted: true,
                                mode: mode.multiple
                            });
                            customBucket.sortBy(columns.firstName, 0, 'asc');
                            customBucket.sortBy(columns.lastName, 1, 'desc');
                            h.dataSource.subscribe.emit('DataRead', params);
                            expect(params.sortBy.length).toBe(3);
                            expect(params.sortBy[0].column).toBe(columns.firstName);
                            expect(params.sortBy[0].direction).toBe('asc');
                            expect(params.sortBy[1].column).toBe(columns.lastName);
                            expect(params.sortBy[1].direction).toBe('desc');
                            expect(params.sortBy[2].column).toBe(columns.age);
                            expect(params.sortBy[2].direction).toBe('desc');
                        });
                        it('work without any sorting applies', function () {
                            var params = {};
                            component = getComponent({ sorting: true }, "");
                            h.dataSource.subscribe.emit('DataRead', params);
                            expect(params.sortBy.length).toBe(0);
                        });
                    });
                    describe('onColumnClicked method should', function () {
                        it('start sorting with default sorting bucket', function () {
                            component = getComponent({ sorting: true }, "");
                            columns.firstName.other.sortable = true;
                            component.sortOrder = 99;
                            component._onColumnClicked(columns.firstName);
                            expect(columns.firstName.state.sortOrder).toBe(100);
                            expect(columns.firstName.state.sortByDirection).toBe('asc');
                            expect(h.gridInternals.refresh.calledOnce).toBe(true);
                        });
                        it('go to next sorting state if column already sorted with default sorting bucket', function () {
                            component = getComponent({ sorting: true }, "");
                            columns.firstName.other.sortable = true;
                            component.sortOrder = 99;
                            component._onColumnClicked(columns.firstName);
                            component._onColumnClicked(columns.firstName);
                            expect(columns.firstName.state.sortOrder).toBe(100);
                            expect(columns.firstName.state.sortByDirection).toBe('desc');
                            expect(h.gridInternals.refresh.calledTwice).toBe(true);
                        });
                        it('do nothing if column is not sortable', function () {
                            component = getComponent({ sorting: true }, "");
                            var test = function (sortable) {
                                columns.firstName.other.sortable = sortable;
                                component._onColumnClicked(columns.firstName);
                                expect(h.gridInternals.refresh.called).toBe(false);
                            };
                            test('false');
                            test(undefined);
                            test(false);
                        });
                    });
                    describe('addBucket method', function () {
                        it('should add bucket', function () {
                            component = getComponent({ sorting: true }, "");
                            var options = {
                                alwaysSorted: true,
                                mode: mode.multiple
                            };
                            var bucket = component.addBucket(BucketOwner, 0, options);
                            expect(component.buckets.length).toBe(2);
                            expect(component.buckets[1].bucket).toBe(bucket);
                            expect(component.buckets[1].owner).toBe(BucketOwner);
                            expect(component.buckets[1].order).toBe(0);
                        });
                        it('should refresh order', function () {
                            component = getComponent({ sorting: true }, "");
                            var options = {
                                alwaysSorted: true,
                                mode: mode.multiple
                            };
                            var bucket1 = component.addBucket(BucketOwner, -1, options);
                            var bucket2 = component.addBucket(BucketOwner, 1, options);
                            expect(component.buckets.length).toBe(3);
                            expect(component.buckets[0].bucket).toBe(bucket1);
                            expect(component.buckets[2].bucket).toBe(bucket2);
                        });
                    });
                    describe('getBucketByColumn method', function () {
                        it('should get bucket which contains given column', function () {
                            component = getComponent({ sorting: true }, "");
                            var bucket = component.addBucket(BucketOwner, 1, {
                                alwaysSorted: true,
                                mode: mode.single
                            });
                            bucket.addColumn(columns.lastName);
                            var result = component.getBucketByColumn(columns.lastName);
                            expect(result).toBe(bucket);
                        });
                        it('should return undefined if bucket not found', function () {
                            component = getComponent({ sorting: true }, "");
                            var result = component.getBucketByColumn(columns.lastName);
                            expect(result).toBeUndefined();
                        });
                    });
                    describe('getBucketByOwner method', function () {
                        it('should get bucket using given owner', function () {
                            component = getComponent({ sorting: true }, "");
                            var bucket = component.addBucket(BucketOwner, 1, {
                                alwaysSorted: true,
                                mode: mode.single
                            });
                            var result = component.getBucketByOwner(BucketOwner);
                            expect(result).toBe(bucket);
                        });
                        it('should return undefined if bucket not found', function () {
                            component = getComponent({ sorting: true }, "");
                            var result = component.getBucketByOwner(BucketOwner);
                            expect(result).toBeUndefined();
                        });
                    });
                    it('should unregister correctly', function () {
                        component = getComponent({ sorting: true }, "");
                        expect(h.gridInternals.subscribe.subscribers.length).toBeGreaterThan(0);
                        expect(h.dataSource.subscribe.subscribers.length).toBeGreaterThan(0);
                        component.stop();
                        expect(h.gridInternals.subscribe.subscribers.length).toBe(0);
                        expect(h.dataSource.subscribe.subscribers.length).toBe(0);
                    });
                });
                describe('bucket', function () {
                    var bucket;
                    var validate = function (column, index, order, direction) {
                        expect(bucket.columns[index]).toBe(column);
                        expect(column.state.sortOrder).toBe(order);
                        expect(bucket.getSortingDirection(column)).toBe(direction);
                        expect(column.hasClass('m-grid-sort-' + direction)).toBe(true);
                        expect(column.hasClass('m-grid-sort-' + (direction === 'asc' ? 'desc' : 'asc'))).toBe(false);
                    };
                    describe('sortBy method should', function () {
                        it('apply sorting to the column with multiple mode', function () {
                            bucket = getBucket({ mode: mode.multiple, alwaysSorted: undefined });
                            bucket.sortBy(columns.lastName, 3, 'desc');
                            bucket.sortBy(columns.firstName, 0, 'asc');
                            bucket.sortBy(columns.age, 1, 'asc');
                            expect(bucket.columns.length).toBe(3);
                            validate(columns.lastName, 0, 3, 'desc');
                            validate(columns.firstName, 1, 0, 'asc');
                            validate(columns.age, 2, 1, 'asc');
                        });
                        it('apply sorting to the column with single mode', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.sortBy(columns.lastName, 3, 'desc');
                            bucket.sortBy(columns.firstName, 0, 'asc');
                            bucket.sortBy(columns.age, 1, 'asc');
                            expect(bucket.columns.length).toBe(1);
                            validate(columns.age, 0, 1, 'asc');
                        });
                        it('use previous sorted direction as default if has been already sorted', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.sortBy(columns.lastName, 1, 'desc');
                            bucket.sortBy(columns.lastName, 3, undefined);
                            validate(columns.lastName, 0, 3, 'desc');
                        });
                        it('use "asc" direction if other not specified', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            columns.lastName.state.sortOrder = 1;
                            bucket.sortBy(columns.lastName, 3, undefined);
                            validate(columns.lastName, 0, 3, 'asc');
                        });
                    });
                    describe('nextSortingDirectionOn method should', function () {
                        it('switch from "asc" to "desc" direction', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.sortBy(columns.firstName, 1, 'asc');
                            bucket.nextSortingDirectionOn(columns.firstName);
                            expect(bucket.getSortingDirection(columns.firstName)).toBe('desc');
                        });
                        it('switch from "desc" to "asc" direction if alwaysSorted option is enabled', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: true });
                            bucket.sortBy(columns.firstName, 1, 'desc');
                            bucket.nextSortingDirectionOn(columns.firstName);
                            expect(bucket.getSortingDirection(columns.firstName)).toBe('asc');
                        });
                        it('switch clear from "desc" direction if alwaysSorted option is disabled', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: false });
                            bucket.sortBy(columns.firstName, 1, 'desc');
                            bucket.nextSortingDirectionOn(columns.firstName);
                            expect(!!bucket.getSortingDirection(columns.firstName)).toBe(false);
                        });
                        it('do nothing if column is not in the bucket', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: false });
                            bucket.nextSortingDirectionOn(columns.firstName);
                            expect(bucket.columns.length).toBe(0);
                            expect(columns.firstName.headerClass).toBe('');
                        });
                    });
                    it('hasSortingApplied method should determine if sorting has been applied to the column', function () {
                        bucket = getBucket({ mode: mode.single, alwaysSorted: false });
                        bucket.sortBy(columns.firstName, 1, 'desc');
                        bucket.sortBy(columns.age, 2, 'asc');
                        expect(bucket.hasSortingApplied(columns.firstName)).toBe(false);
                        expect(bucket.hasSortingApplied(columns.lastName)).toBe(false);
                        expect(bucket.hasSortingApplied(columns.age)).toBe(true);
                    });
                    describe('addColumn method should', function () {
                        it('add new column', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.addColumn(columns.age);
                            expect(bucket.columns.length).toBe(1);
                            expect(bucket.columns).toContain(columns.age);
                        });
                        it('do nothing if column has been already added', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.addColumn(columns.age);
                            bucket.addColumn(columns.age);
                            expect(bucket.columns.length).toBe(1);
                            expect(bucket.columns).toContain(columns.age);
                        });
                    });
                    describe('removeColumn method should', function () {
                        it('remove existing column', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.addColumn(columns.age);
                            bucket.removeColumn(columns.age);
                            expect(bucket.columns.length).toBe(0);
                            expect(bucket.columns).not.toContain(columns.age);
                        });
                        it('do nothing if column is not in the bucket', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.removeColumn(columns.age);
                            expect(bucket.columns.length).toBe(0);
                            expect(bucket.columns).not.toContain(columns.age);
                        });
                    });
                    describe('hasColumn method should', function () {
                        it('return true if column in the bucket', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            bucket.addColumn(columns.age);
                            var result = bucket.hasColumn(columns.age);
                            expect(result).toBe(true);
                        });
                        it('return false if column is not in the bucket', function () {
                            bucket = getBucket({ mode: mode.single, alwaysSorted: undefined });
                            var result = bucket.hasColumn(columns.age);
                            expect(result).toBe(false);
                        });
                    });
                });
            });
        }
    }
});
