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
var diff_1 = require("./diff");
var registry_1 = require("./registry");
var resolveArray = function (array, context, getResolvedIndex) {
    if (getResolvedIndex === void 0) { getResolvedIndex = function (resolved) { return resolved.length; }; }
    var resolve = context.resolve;
    var additionsMap = new Map();
    var childAdditionsMap = new Map();
    var removalsMap = new Map();
    var childRemovalsMap = new Map();
    var accumulatedRemovals = [];
    var resolvedElements = [];
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var element = array_1[_i];
        var resolvedIndex = getResolvedIndex(resolvedElements);
        var resolvedElement = null;
        if (element[diff_1.diffObjectSymbol]) {
            if (element.remove) {
                accumulatedRemovals.push(element.remove);
            }
            if (element.add) {
                resolvedElement = element.add;
                additionsMap.set(resolvedIndex, resolvedElement);
            }
        }
        else {
            var resolveResult = resolve(element);
            resolvedElement =
                typeof resolveResult === 'string'
                    ? resolveResult
                    : resolveResult.element;
            if (resolveResult.removals) {
                childRemovalsMap.set(resolvedIndex, resolveResult.removals);
            }
            if (resolveResult.additions) {
                childAdditionsMap.set(resolvedIndex, resolveResult.additions);
            }
        }
        if (resolvedElement) {
            removalsMap.set(resolvedIndex, accumulatedRemovals);
            accumulatedRemovals = [];
            resolvedElements.push(resolvedElement);
        }
    }
    if (accumulatedRemovals.length) {
        removalsMap.set('end', accumulatedRemovals);
    }
    return {
        resolvedElements: resolvedElements,
        additions: {
            map: additionsMap,
            children: childAdditionsMap
        },
        removals: {
            map: removalsMap,
            children: childRemovalsMap
        }
    };
};
exports.resolveText = function (textElement, context) {
    var _a = resolveArray(textElement.text, context, function (elements) { return elements.map(function (x) { return x.length; }).reduce(function (a, b) { return a + b; }, 0); }), additions = _a.additions, removals = _a.removals, resolvedElements = _a.resolvedElements;
    return {
        element: __assign({}, textElement, { text: resolvedElements.join('') }),
        additions: {
            text: additions
        },
        removals: {
            text: removals
        }
    };
};
exports.resolveElementWithContent = function (element, context) {
    var _a = resolveArray(element.content || [], context), additions = _a.additions, removals = _a.removals, resolvedElements = _a.resolvedElements;
    return {
        element: __assign({}, element, { 
            // If element.content was null, don't pass in [] for resolvedElements
            content: element.content && resolvedElements }),
        removals: {
            content: removals
        },
        additions: {
            content: additions
        }
    };
};
exports.resolve = function (diffResult, registry) {
    var resolve = function (element) {
        if (typeof element === 'string') {
            return element;
        }
        return registry_1.getTypeFromRegistry(registry, element.type).render.resolve(element, { resolve: resolve });
    };
    var result = resolve(diffResult);
    return {
        doc: result.element,
        additions: result.additions,
        removals: result.removals
    };
};
