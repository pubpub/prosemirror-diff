"use strict";
exports.__esModule = true;
exports.createCompareMarks = function (ignored) { return function (oldValue, newValue, context) {
    var incomparable = context.incomparable;
    if (!oldValue && !newValue) {
        return { result: oldValue, cost: 0 };
    }
    if (!oldValue || !newValue) {
        return incomparable;
    }
    var oldTypes = (ignored
        ? oldValue.filter(function (mark) { return !ignored.includes(mark); })
        : oldValue).map(function (x) { return x.type; });
    var newTypes = (ignored
        ? newValue.filter(function (mark) { return !ignored.includes(mark); })
        : newValue).map(function (x) { return x.type; });
    if (oldTypes.length !== newTypes.length) {
        return incomparable;
    }
    if (oldTypes.every(function (mark) { return newTypes.includes(mark); })) {
        return { result: oldValue, cost: 0 };
    }
    return incomparable;
}; };
