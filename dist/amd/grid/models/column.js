define(["require", "exports", '../grid'], function (require, exports, grid_1) {
    "use strict";
    var Column = (function () {
        function Column(id, attributes, template, gridInternals) {
            this.id = null;
            this.heading = undefined;
            this.field = undefined;
            this.width = undefined;
            this.hidden = undefined;
            this.other = {};
            this.headerClass = '';
            this.owner = grid_1.Grid;
            this.oldOwner = null;
            /**
             * State of column. Used by components to store some infromation about
             * column, e.g. sort order if sorted.
             */
            this.state = {};
            // TODO: since uniqueId is defined then id is not needed?
            this._uniqueId = undefined;
            this.id = id;
            this._gridInternals = gridInternals;
            for (var variable in this) {
                if (this[variable] === undefined) {
                    if (attributes[variable] === '') {
                        this[variable] = true;
                        continue;
                    }
                    this[variable] = attributes[variable];
                }
            }
            for (var variable in attributes) {
                if (this[variable] !== undefined)
                    continue;
                if (attributes[variable] === '') {
                    this.other[variable] = true;
                    continue;
                }
                this.other[variable] = attributes[variable];
            }
            if (this.heading === undefined) {
                this.heading = this.field;
            }
            this._uniqueId = attributes['explicit-id'];
            this.template = template;
            this.validate();
        }
        Column.prototype.validate = function () {
            if (this.field) {
                if (this.field.indexOf(' ') !== -1) {
                    throw new Error("Field name cannot contain spaces. '" + this.field + "' doesn't meet this requirement.");
                }
                if (this.field.indexOf(',') !== -1) {
                    throw new Error("Field name cannot contain commas. '" + this.field + "' doesn't meet this requirement.");
                }
            }
        };
        Column.prototype.addClass = function (name) {
            if (this.hasClass(name)) {
                return;
            }
            this.headerClass += ' ' + name;
        };
        Column.prototype.removeClass = function (name) {
            if (!this.hasClass(name)) {
                return;
            }
            this.headerClass = this.headerClass.replace(' ' + name, '');
            this.headerClass = this.headerClass.replace(name, '');
        };
        Column.prototype.hasClass = function (name) {
            if (this.headerClass !== undefined && this.headerClass.indexOf(name) !== -1) {
                return true;
            }
            return false;
        };
        Column.prototype.setOwner = function (newOwner) {
            this.oldOwner = this.owner;
            this.owner = newOwner;
            var changed = this.oldOwner !== this.owner;
            if (changed) {
                this._gridInternals.publish('ColumnOwnerChanged', { column: this });
            }
            return changed;
        };
        /**
         * Provides unique column id. If declared as "explicit-id" on the column
         * declaration then this value will be used.
         * Otherwise unique id is a combination of field, heading and template.
         * In case if these 2 wouldn't be unique then it is required to use "explicit-id".
         */
        Column.prototype.getUniqueId = function () {
            if (this._uniqueId === undefined) {
                return this.field + this.heading + this.template;
            }
            return this._uniqueId;
        };
        return Column;
    }());
    exports.Column = Column;
});
