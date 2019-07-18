"use strict";
exports.__esModule = true;
exports.createCompareObjects = function (comparableSchema, keyHints) {
    var sortKeys = keyHints
        ? function (keys) {
            return Array.from(keys).sort(function (a, b) {
                return keyHints.indexOf(a) - keyHints.indexOf(b);
            });
        }
        : function (x) { return x; };
    return function (oldVersion, newVersion, context) {
        var replace = context.replace, weight = context.weight, incomparable = context.incomparable, memoizer = context.memoizer, _a = context.budget, budget = _a === void 0 ? Infinity : _a;
        var compareCost = 0;
        var compareObj = function (innerSchema, innerOld, innerNew) {
            var resObj = {};
            for (var _i = 0, _a = sortKeys(new Set(Object.keys(innerOld).concat(Object.keys(innerNew)))); _i < _a.length; _i++) {
                var key = _a[_i];
                var oldValue = innerOld[key];
                var newValue = innerNew[key];
                var schemaAtKey = innerSchema[key];
                if (typeof schemaAtKey === 'function') {
                    // We've found a sub-key that is comparable.
                    var compared = memoizer.compare(schemaAtKey)(oldValue, newValue, context);
                    if (compared === incomparable) {
                        return incomparable;
                    }
                    var result = compared.result, cost = compared.cost;
                    resObj[key] = result;
                    compareCost += cost;
                    if (compareCost > budget) {
                        return incomparable;
                    }
                }
                else if (typeof schemaAtKey === 'object') {
                    // We need to recurse farther into the comparator.
                    var compareResult_1 = compareObj(schemaAtKey, oldValue, newValue);
                    if (compareResult_1 === incomparable) {
                        return incomparable;
                    }
                    resObj[key] = compareResult_1;
                }
                else {
                    resObj[key] = innerNew[key];
                }
            }
            return resObj;
        };
        var compareResult = compareObj(comparableSchema, oldVersion, newVersion);
        if (compareResult === incomparable) {
            return {
                result: replace(oldVersion, newVersion),
                cost: weight(oldVersion) + weight(newVersion)
            };
        }
        return { result: compareResult, cost: compareCost };
    };
};
