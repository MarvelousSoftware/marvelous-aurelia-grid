define(["require", "exports", 'marvelous-aurelia-core/utils', '../all'], function (require, exports, utils_1, all_1) {
    "use strict";
    var DataSource = (function () {
        function DataSource(grid, options) {
            this.subscribers = {};
            this.lastReadId = 0;
            this.grid = grid;
            this.options = options;
        }
        DataSource.prototype.read = function () {
            var _this = this;
            var currentReadId = ++this.lastReadId;
            var params = {};
            this.publish('DataRead', params);
            params = this.beforeRead(params);
            var context = {
                params: params,
                url: function (baseUrl) {
                    return utils_1.Utils.combineUrlWithParams(baseUrl, params);
                }
            };
            var readResult = this.options.read(context);
            if (!readResult) {
                return new Promise(function (resolve) { resolve(); });
            }
            if (!(readResult.then instanceof Function)) {
                readResult = all_1.DataSourceManager.createReadMethod(readResult)(context);
            }
            return readResult.then(function (rawResult) {
                if (currentReadId !== _this.lastReadId) {
                    // Meanwhile new read method invokation happened
                    // so an old request is no longer valid.
                    // This can happen mainly in case if user clicks
                    // too fast on the ui. Bad users!
                    return;
                }
                _this.lastParams = params;
                _this.onRawResultReceived(rawResult);
                _this.setNewResult(rawResult, params);
                return rawResult;
            }, function (error) {
                _this.publish('DataReadError', error);
                return error;
            });
        };
        DataSource.prototype.setNewResult = function (rawResult, params) {
            try {
                var result = this.transformResult(rawResult, params);
                this.result = result;
                var eventPayload = {
                    result: result,
                    rawResult: rawResult
                };
                this.publish('DataReceived', eventPayload);
            }
            catch (e) {
                if (console.error) {
                    console.error(e);
                }
            }
        };
        DataSource.prototype.subscribe = function (eventName, callback) {
            var _this = this;
            this.subscribers[eventName] = this.subscribers[eventName] || [];
            this.subscribers[eventName].push(callback);
            return function () {
                _this.subscribers[eventName].splice(_this.subscribers[eventName].indexOf(callback), 1);
            };
        };
        DataSource.prototype.publish = function (eventName, payload) {
            var subs = this.subscribers[eventName];
            if (subs) {
                subs.forEach(function (sub) { return sub(payload); });
            }
            // invokes event handler from dataSource options if defined
            // it is invoked after internals, so that all changes (e.g. page number)
            // will be available on the payload
            var userDefinedHandler = this.options['on' + eventName];
            if (userDefinedHandler instanceof Function) {
                userDefinedHandler(payload);
            }
        };
        DataSource.prototype.transformResult = function (rawResult, params) {
            if (!rawResult.data || rawResult.total === undefined) {
                throw new Error('Missing data or total property in data source result.');
            }
            return rawResult;
        };
        DataSource.prototype.addItem = function (item) {
            throw new Error('Not supported.');
        };
        DataSource.prototype.removeItem = function (item) {
            throw new Error('Not supported.');
        };
        /**
         * Invoked right after data arrival.
         * @param result Contains raw data from read method.
         */
        DataSource.prototype.onRawResultReceived = function (rawResult) {
            this.rawResult = rawResult;
        };
        /**
         * Invoked right before reading data, but after parameters creation.
         * This method should be used in order to manipulate parameters, e.g.
         * by using some sort of serialization.
         */
        DataSource.prototype.beforeRead = function (params) {
            return params;
        };
        return DataSource;
    }());
    exports.DataSource = DataSource;
});
