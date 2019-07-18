"use strict";
exports.__esModule = true;
exports.passThroughStringifyMap = function (object, stringifyMap) {
    if (stringifyMap.get(object)) {
        return stringifyMap.get(object);
    }
    else {
        var string = JSON.stringify(object);
        stringifyMap.set(object, string);
        return string;
    }
};
exports.memoizeCompareFn = function (compare, _a) {
    var compareMap = _a.compareMap, stringifyMap = _a.stringifyMap, recordHit = _a.recordHit, recordMiss = _a.recordMiss;
    if (typeof compare !== 'function') {
        throw new Error('Invalid input to memoizeCompareFn');
    }
    return function (oldVersion, newVersion) {
        var restArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            restArgs[_i - 2] = arguments[_i];
        }
        var oldString = exports.passThroughStringifyMap(oldVersion, stringifyMap);
        var newString = exports.passThroughStringifyMap(newVersion, stringifyMap);
        var innerMap = compareMap.get(oldString);
        if (!innerMap) {
            innerMap = new Map();
            compareMap.set(oldString, innerMap);
        }
        var maybeResult = innerMap.get(newString);
        if (maybeResult) {
            recordHit();
            return maybeResult;
        }
        recordMiss();
        var result = compare.apply(void 0, [oldVersion, newVersion].concat(restArgs));
        innerMap.set(newString, result);
        return result;
    };
};
exports.memoizeWeightFn = function (weight, _a) {
    var weightMap = _a.weightMap, stringifyMap = _a.stringifyMap, recordHit = _a.recordHit, recordMiss = _a.recordMiss;
    return function (element) {
        var restArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            restArgs[_i - 1] = arguments[_i];
        }
        var elementString = exports.passThroughStringifyMap(element, stringifyMap);
        var mapValue = weightMap.get(elementString);
        if (mapValue) {
            recordHit();
            return mapValue;
        }
        else {
            recordMiss();
            var result = weight.apply(void 0, [element].concat(restArgs));
            weightMap.set(elementString, result);
            return result;
        }
    };
};
var makeMemoStore = function () {
    var hits = 0;
    var misses = 0;
    return {
        weightMap: new Map(),
        compareMap: new Map(),
        stringifyMap: new Map(),
        recordHit: function () {
            hits += 1;
        },
        recordMiss: function () {
            misses += 1;
        },
        getHitRate: function () {
            if (misses === 0) {
                return 0;
            }
            return hits / (hits + misses);
        },
        clearHitRate: function () {
            hits = 0;
            misses = 0;
        }
    };
};
exports.makeMemoizer = function () {
    var store = makeMemoStore();
    var makeMemoize = function (memoizingFn) { return function (fn) {
        var fnMap = new Map();
        var memoized = fnMap.get(fn);
        if (memoized) {
            return memoized;
        }
        var memoizedHere = memoizingFn(fn, store);
        fnMap.set(fn, memoizedHere);
        return memoizedHere;
    }; };
    return {
        compare: makeMemoize(exports.memoizeCompareFn),
        weight: makeMemoize(exports.memoizeWeightFn),
        getHitRate: store.getHitRate,
        clearHitRate: store.clearHitRate
    };
};
