System.register(['../../unitTesting/grid/base', './column-chooser', './column-reordering', './toolbox'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var base_1, column_chooser_1, column_reordering_1, toolbox_1;
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (column_chooser_1_1) {
                column_chooser_1 = column_chooser_1_1;
            },
            function (column_reordering_1_1) {
                column_reordering_1 = column_reordering_1_1;
            },
            function (toolbox_1_1) {
                toolbox_1 = toolbox_1_1;
            }],
        execute: function() {
            describe('Column chooser component', function () {
                var h;
                var columns;
                var getComponent = function (codeBased, domBased) {
                    if (codeBased === void 0) { codeBased = { columnChooser: true }; }
                    if (domBased === void 0) { domBased = ""; }
                    var gridOptions = h.getGridOptions(codeBased, domBased + "<columns><column field=\"FirstName\"></column><column field=\"LastName\"></column><column field=\"Age\"></column></column><column field=\"DateOfBirth\"></column></columns>");
                    gridOptions.columns = [columns.firstName, columns.lastName, columns.age];
                    var subject = new column_chooser_1.ColumnChooserComponent(h.gridInternals, gridOptions, h.components);
                    subject.tryEnable();
                    return subject;
                };
                var reorderingRegistration;
                var toolboxRegistration;
                beforeEach(function () {
                    h = new base_1.GridTestHelpers();
                    h.beforeEach();
                    columns = {
                        firstName: h.getColumn({
                            field: 'FirstName'
                        }),
                        lastName: h.getColumn({
                            field: 'LastName',
                            hidden: true
                        }),
                        age: h.getColumn({
                            field: 'Age',
                            hidden: true
                        }),
                        dateOfBirth: h.getColumn({
                            field: 'DateOfBirth'
                        })
                    };
                    columns.lastName.owner = column_chooser_1.ColumnChooserComponent;
                    columns.age.owner = column_chooser_1.ColumnChooserComponent;
                    h.gridInternals.mainColumns = [columns.firstName, columns.dateOfBirth];
                    reorderingRegistration = {
                        enable: sinon.spy()
                    };
                    toolboxRegistration = {
                        instance: {
                            addButton: sinon.spy()
                        },
                        enable: sinon.spy()
                    };
                    h.components.get.for(column_reordering_1.ColumnReorderingComponent, reorderingRegistration);
                    h.components.get.for(toolbox_1.ToolboxComponent, toolboxRegistration);
                });
                describe('on init', function () {
                    it('should enable ColumnReorderingComponent', function () {
                        var component = getComponent();
                        expect(reorderingRegistration.enable.calledOnce).toBe(true);
                    });
                    it('should make columns draggable', function () {
                        var component = getComponent();
                        expect(h.gridInternals.makeColumnsDraggable.called).toBe(true);
                    });
                    it('should initialize toolbox', function () {
                        var component = getComponent();
                        component.togglePopUp = sinon.spy();
                        expect(toolboxRegistration.instance.addButton.calledOnce).toBe(true);
                        var arg = toolboxRegistration.instance.addButton.firstCall.args[0];
                        arg.click();
                        expect(arg.text).toBeTruthy();
                        expect(component.togglePopUp.calledOnce).toBe(true);
                    });
                    it('should enable toolbox automaticaly if autoToolboxInit enabled', function () {
                        var component = getComponent({ columnChooser: { autoToolboxInit: true } });
                        expect(toolboxRegistration.enable.calledOnce).toBe(true);
                    });
                    it("shouldn't enable toolbox automaticaly if autoToolboxInit disabled", function () {
                        var component = getComponent({ columnChooser: { autoToolboxInit: false } });
                        expect(toolboxRegistration.enable.called).toBe(false);
                    });
                    it('should take all hidden columns', function () {
                        var component = getComponent();
                        expect(component.columns.length).toBe(2);
                        expect(component.columns).toContain(columns.lastName);
                        expect(component.columns).toContain(columns.age);
                    });
                });
                describe('save state', function () {
                    it('should attach columns to state', function () {
                        var component = getComponent();
                        var state = {};
                        component.saveState(state);
                        expect(state.columns).toEqual([columns.lastName.getUniqueId(), columns.age.getUniqueId()]);
                    });
                });
                describe('load state', function () {
                    it('load columns from state', function () {
                        var component = getComponent();
                        var state = {
                            columns: [columns.age.getUniqueId(), columns.firstName.getUniqueId()]
                        };
                        component.loadState(state);
                        expect(component.columns).toEqual([columns.age, columns.firstName]);
                        expect(component.columns.map(function (x) { return x.owner; })).toEqual([column_chooser_1.ColumnChooserComponent, column_chooser_1.ColumnChooserComponent]);
                    });
                });
                describe('should be able to react on ColumnOwnerChanged event', function () {
                    it('by removing item from columns array and marking it as not hidden any more', function () {
                        var component = getComponent();
                        columns.lastName.owner = toolbox_1.ToolboxComponent;
                        var msg = { column: columns.lastName };
                        expect(columns.lastName.hidden).toBe(true);
                        h.gridInternals.subscribe.emit('ColumnOwnerChanged', msg);
                        expect(columns.lastName.hidden).toBe(false);
                        expect(component.columns).toEqual([columns.age]);
                    });
                    it('and do nothing if column owner is still column chooser', function () {
                        var component = getComponent();
                        var msg = { column: columns.lastName };
                        var length = component.columns.length;
                        expect(columns.lastName.hidden).toBe(true);
                        h.gridInternals.subscribe.emit('ColumnOwnerChanged', msg);
                        expect(columns.lastName.hidden).toBe(true);
                        expect(component.columns.length).toEqual(length);
                    });
                });
                describe('should react on columns drag and drop', function () {
                    it('dropped should change owner of column', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        columns.firstName.setOwner = sinon.spy();
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
                        expect(columns.firstName.setOwner.calledWithExactly(column_chooser_1.ColumnChooserComponent)).toBe(true);
                    });
                    it('dropped should change owner of column only if main grid has at least 2 columns', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        columns.firstName.setOwner = sinon.spy();
                        h.gridInternals.mainColumns.splice(1);
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
                        expect(columns.firstName.setOwner.called).toBe(false);
                    });
                    it('dropped should change owner of column only column does not belong already to column chooser', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        columns.lastName.setOwner = sinon.spy();
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.lastName);
                        expect(columns.lastName.setOwner.called).toBe(false);
                    });
                    it('dropped should change overDroppable state', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.lastName);
                        expect(component.overDroppable).toBe(false);
                    });
                    it('dropped should move column from main to column chooser', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        expect(h.gridInternals.mainColumns).toContain(columns.firstName);
                        expect(component.columns).not.toContain(columns.firstName);
                        expect(columns.firstName.hidden).toBeFalsy();
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
                        expect(h.gridInternals.mainColumns).not.toContain(columns.firstName);
                        expect(component.columns).toContain(columns.firstName);
                        expect(columns.firstName.hidden).toBe(true);
                    });
                    it('dropped should maintain columns sorted', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        expect(component.columns).not.toContain(columns.firstName);
                        h.gridInternals.listenOnDragAndDrop.dropped(undefined, undefined, columns.firstName);
                        expect(component.columns).toEqual([columns.age, columns.firstName, columns.lastName]);
                    });
                    it('overDroppable should change state if column is not already in the column chooser', function () {
                        var component = getComponent();
                        component.overDroppable = false;
                        h.gridInternals.listenOnDragAndDrop.overDroppable(undefined, undefined, columns.firstName);
                        expect(component.overDroppable).toBe(true);
                    });
                    it('overDroppable should not change state if column is already in the column chooser', function () {
                        var component = getComponent();
                        component.overDroppable = false;
                        h.gridInternals.listenOnDragAndDrop.overDroppable(undefined, undefined, columns.lastName);
                        expect(component.overDroppable).toBe(false);
                    });
                    it('outsideDroppable should change overDroppable state', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        h.gridInternals.listenOnDragAndDrop.outsideDroppable(undefined, undefined, columns.lastName);
                        expect(component.overDroppable).toBe(false);
                    });
                    it('canceled should change overDroppable state', function () {
                        var component = getComponent();
                        component.overDroppable = true;
                        h.gridInternals.listenOnDragAndDrop.canceled(undefined, undefined, columns.lastName);
                        expect(component.overDroppable).toBe(false);
                    });
                });
                describe('togglePopUp method', function () {
                    it('should show popup if hidden', function () {
                        var component = getComponent();
                        component.hidden = true;
                        component.togglePopUp();
                        expect(component.hidden).toBe(false);
                    });
                    it('should hide popup if visible', function () {
                        var component = getComponent();
                        component.hidden = false;
                        component.togglePopUp();
                        expect(component.hidden).toBe(true);
                    });
                });
                describe('should be able to create options', function () {
                    it('from code based settings', function () {
                        var component = getComponent({ columnChooser: {
                                autoToolboxInit: false
                            } }, "");
                        expect(component.options).not.toEqual(component.defaultOptions);
                        expect(component.options).toEqual({
                            autoToolboxInit: false
                        });
                    });
                    it('from DOM based settings', function () {
                        var component = getComponent({}, "<column-chooser auto-toolbox-init.bind=\"false\"></column-chooser>");
                        expect(component.options).not.toEqual(component.defaultOptions);
                        expect(component.options).toEqual({
                            autoToolboxInit: false
                        });
                    });
                    it('using default options as a fallback plan', function () {
                        var component = getComponent({ columnChooser: true }, "");
                        expect(component.options).toEqual(component.defaultOptions);
                    });
                    it('when configuration is not available', function () {
                        var pagination = getComponent({}, "");
                        var options = pagination.createOptions();
                        expect(options).toBeFalsy();
                    });
                });
                it('should unregister correctly', function () {
                    var component = getComponent();
                    expect(h.gridInternals.subscribe.subscribers.length).toBeGreaterThan(0);
                    component.stop();
                    expect(h.gridInternals.subscribe.subscribers.length).toBe(0);
                });
            });
        }
    }
});
