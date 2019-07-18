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
var heap_1 = require("heap");
var sum = function (arr) {
    var res = 0;
    for (var i = 0; i < arr.length; i++) {
        res += arr[i];
    }
    return res;
};
var createStateMap = function () {
    var outerMap = new Map();
    var ensuredInnerMapAtKey = function (k) {
        var maybeExists = outerMap.get(k);
        if (maybeExists) {
            return maybeExists;
        }
        var innerMap = new Map();
        outerMap.set(k, innerMap);
        return innerMap;
    };
    var getValueAtPosition = function (a, r) {
        return ensuredInnerMapAtKey(a).get(r);
    };
    var setValueAtPosition = function (a, r, value) {
        ensuredInnerMapAtKey(a).set(r, value);
    };
    return { getValueAtPosition: getValueAtPosition, setValueAtPosition: setValueAtPosition };
};
var createBestStateMap = function () {
    var _a = createStateMap(), getValueAtPosition = _a.getValueAtPosition, setValueAtPosition = _a.setValueAtPosition;
    var markState = function (state) {
        var a = state.a, r = state.r;
        setValueAtPosition(a, r, state);
    };
    var isBetterState = function (state) {
        var minimumCost = state.minimumCost, a = state.a, r = state.r, result = state.result;
        var currentValue = getValueAtPosition(a, r);
        return (!currentValue ||
            (currentValue.minimumCost > minimumCost &&
                currentValue.result.length >= result.length));
    };
    return { markState: markState, isBetterState: isBetterState, getValueAtPosition: getValueAtPosition };
};
exports.compareArray = function (oldVersion, newVersion, context) {
    if (oldVersion === void 0) { oldVersion = []; }
    if (newVersion === void 0) { newVersion = []; }
    var compare = context.compare, add = context.add, remove = context.remove, weight = context.weight, incomparable = context.incomparable, memoizer = context.memoizer;
    var memoWeight = memoizer.weight(weight);
    var rExtent = oldVersion.length - 1;
    var aExtent = newVersion.length - 1;
    var rWeights = oldVersion.map(memoWeight);
    var aWeights = newVersion.map(memoWeight);
    var bestStateMap = createBestStateMap();
    var minimumCostMap = createStateMap();
    var heap = new heap_1["default"](function (a, b) { return a.minimumCost - b.minimumCost; });
    var getMinimumCostToGoal = function (a, r) {
        var maybeValue = minimumCostMap.getValueAtPosition(a, r);
        if (maybeValue || maybeValue === 0) {
            // return maybeValue;
        }
        var remainingAdditionTraversal = aExtent - a;
        var remainingRemovalTraversal = rExtent - r;
        var remainingDiagonals = Math.min(remainingAdditionTraversal, remainingRemovalTraversal);
        var remainingAdditionsSorted = aWeights
            .slice(a + 1, aExtent + 1)
            .sort(function (a, b) { return a - b; })
            .slice(0, remainingAdditionTraversal - remainingDiagonals);
        var remainingRemovalsSorted = rWeights
            .slice(r + 1, rExtent + 1)
            .sort(function (a, b) { return a - b; })
            .slice(0, remainingRemovalTraversal - remainingDiagonals);
        var value = sum(remainingAdditionsSorted) + sum(remainingRemovalsSorted);
        minimumCostMap.setValueAtPosition(a, r, value);
        return value;
    };
    var makeState = function (a, r, cost, result, parent) {
        if (parent === void 0) { parent = null; }
        return {
            parent: parent,
            a: a,
            r: r,
            cost: cost,
            result: result,
            minimumCost: cost + getMinimumCostToGoal(a, r)
        };
    };
    var getSuccessorStates = function (currentState) {
        var r = currentState.r, a = currentState.a, cost = currentState.cost, result = currentState.result;
        var nextStates = [];
        var hasAnotherRemoval = r < rExtent;
        var hasAnotherAddition = a < aExtent;
        if (hasAnotherRemoval) {
            var toRemove = oldVersion[r + 1];
            var weight_1 = rWeights[r + 1];
            var newCost = cost + weight_1;
            var newState = makeState(a, r + 1, newCost, result.concat([remove(toRemove)]), currentState);
            if (bestStateMap.isBetterState(newState)) {
                bestStateMap.markState(newState);
                nextStates.push(newState);
            }
        }
        if (hasAnotherAddition) {
            var toAdd = newVersion[a + 1];
            var weight_2 = aWeights[a + 1];
            var newCost = cost + weight_2;
            var newState = makeState(a + 1, r, newCost, result.concat([add(toAdd)]), currentState);
            if (bestStateMap.isBetterState(newState)) {
                bestStateMap.markState(newState);
                nextStates.push(newState);
            }
        }
        if (hasAnotherAddition && hasAnotherRemoval) {
            var subcompare = compare(oldVersion[r + 1], newVersion[a + 1], __assign({}, context));
            if (subcompare !== incomparable) {
                var subcost = subcompare.cost, subresult = subcompare.result;
                var newCost = cost + subcost;
                var newState = makeState(a + 1, r + 1, newCost, result.concat([subresult]), currentState);
                if (bestStateMap.isBetterState(newState)) {
                    bestStateMap.markState(newState);
                    nextStates.push(newState);
                }
            }
        }
        return nextStates;
    };
    heap.push(makeState(-1, -1, 0, []));
    while (!heap.empty()) {
        var firstState = heap.pop();
        var equallyMeritousStates = [firstState];
        while (!heap.empty() &&
            heap.peek().minimumCost === firstState.minimumCost) {
            equallyMeritousStates.push(heap.pop());
        }
        for (var _i = 0, equallyMeritousStates_1 = equallyMeritousStates; _i < equallyMeritousStates_1.length; _i++) {
            var state = equallyMeritousStates_1[_i];
            if (state.r === rExtent && state.a === aExtent) {
                return state;
            }
            getSuccessorStates(state).forEach(function (state) { return heap.push(state); });
        }
    }
};
