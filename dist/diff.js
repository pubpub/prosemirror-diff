"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var registry_1 = require("./registry");
exports.diffObjectSymbol = Symbol["for"]('isDiffObject');
var incomparable = Symbol["for"]('incomparable');
var add = function (item) {
    var _a;
    return _a = {},
        _a[exports.diffObjectSymbol] = true,
        _a.add = item,
        _a;
};
var remove = function (item) {
    var _a;
    return _a = {},
        _a[exports.diffObjectSymbol] = true,
        _a.remove = item,
        _a;
};
var replace = function (removed, added) {
    var _a;
    return __assign((_a = {}, _a[exports.diffObjectSymbol] = true, _a), remove(removed), add(added));
};
var innerDiff = function (oldVersion, newVersion, registry, memoizer) {
    var compare = function (ov, nv, context) {
        if (ov.type !== nv.type) {
            return incomparable;
        }
        return memoizer.compare(registry_1.getTypeFromRegistry(registry, ov.type).diff.compare)(ov, nv, context);
    };
    var weight = function (element) {
        var resultWeight = memoizer.weight(registry_1.getTypeFromRegistry(registry, element.type).diff.weight)(element, weight);
        if (isNaN(resultWeight)) {
            throw new Error('prosemirror-diff produced invalid element weight');
        }
        return resultWeight;
    };
    return registry.doc.diff.compare(oldVersion, newVersion, {
        add: add,
        remove: remove,
        replace: replace,
        compare: compare,
        weight: weight,
        incomparable: incomparable,
        memoizer: memoizer
    });
};
exports.diff = function (oldVersion, newVersion, registry, memoizer) {
    var result = innerDiff(oldVersion, newVersion, registry, memoizer).result;
    return result;
};
