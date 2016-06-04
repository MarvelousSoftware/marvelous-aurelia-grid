"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var aurelia_binding_1 = require('aurelia-binding');
var config_1 = require('../config');
var TranslateValueConverter = (function () {
    function TranslateValueConverter() {
    }
    TranslateValueConverter.prototype.toView = function (value) {
        return this.translate(value, config_1.gridConfig.language);
    };
    TranslateValueConverter.prototype.translate = function (key, lang) {
        var translations = config_1.gridConfig.translations[lang];
        if (!!translations === false) {
            throw new Error("Translations for '" + lang + "' language has been not found.");
        }
        if (key in translations) {
            return translations[key];
        }
        if (lang !== config_1.gridConfig.fallbackLanguage) {
            return this.translate(key, config_1.gridConfig.fallbackLanguage);
        }
        return key;
    };
    TranslateValueConverter = __decorate([
        aurelia_binding_1.valueConverter('mGridTranslate')
    ], TranslateValueConverter);
    return TranslateValueConverter;
}());
exports.TranslateValueConverter = TranslateValueConverter;
