"use strict";
exports.__esModule = true;
var diff_1 = require("diff");
var memoize_1 = require("./memoize");
var makeSymbolTable = function () {
    var stringifyMap = new Map();
    var stringToSymbolMap = new Map();
    var symbolToElementMap = new Map();
    var getSymbolForElement = function (element) {
        var string = memoize_1.passThroughStringifyMap(element, stringifyMap);
        var maybeResult = stringToSymbolMap.get(string);
        if (maybeResult) {
            return maybeResult;
        }
        var newSymbol = Symbol["for"](string);
        stringToSymbolMap.set(string, newSymbol);
        symbolToElementMap.set(newSymbol, element);
        return newSymbol;
    };
    var getElementForSymbol = function (symbol) {
        return symbolToElementMap.get(symbol);
    };
    return {
        getSymbolForElement: getSymbolForElement,
        getElementForSymbol: getElementForSymbol
    };
};
var tokenizeElement = function (element, marksTable, atomicTable, separator) {
    var symbol = marksTable.getSymbolForElement(element.marks);
    if (element.type === 'text') {
        var textParts = element.text.split(separator);
        var res = [];
        for (var i = 0; i < textParts.length; i++) {
            var textWithSeparator = textParts[i] + (i === textParts.length - 1 ? '' : separator);
            if (textWithSeparator.length > 0) {
                res.push([symbol, textWithSeparator]);
            }
        }
        return res;
    }
    return [atomicTable.getSymbolForElement(element)];
};
var tokenizeTextArray = function (array, marksTable, atomicTable, separator) {
    var res = [];
    for (var i = 0; i < array.length; i++) {
        var tokenizeResult = tokenizeElement(array[i], marksTable, atomicTable, separator);
        for (var j = 0; j < tokenizeResult.length; j++) {
            res.push(tokenizeResult[j]);
        }
    }
    return res;
};
var compareDiffElement = function (left, right) {
    if (left === right) {
        return true;
    }
    else {
        return left[0] === right[0] && left[1] === right[1];
    }
};
var createElementsFromDiffResult = function (diffResult, marksTable, atomicTable) {
    var result = [];
    var pendingText = '';
    var pendingMarkSymbol = null;
    var cost = 0;
    var flushPending = function () {
        if (pendingText.length > 0) {
            result.push({
                type: 'text',
                text: pendingText,
                marks: marksTable.getElementForSymbol(pendingMarkSymbol)
            });
            cost += pendingText.length;
        }
        pendingText = '';
        pendingMarkSymbol = null;
    };
    for (var i = 0; i < diffResult.length; i++) {
        var item = diffResult[i];
        if (typeof item === 'symbol') {
            flushPending();
            var maybeAtomic = atomicTable.getElementForSymbol(item);
            if (maybeAtomic) {
                result.push(maybeAtomic);
            }
            else {
                throw new Error('Missing symbol for element');
            }
        }
        else {
            var _a = diffResult[i], markSymbol = _a[0], text = _a[1];
            if (text.length > 0) {
                if (markSymbol !== pendingMarkSymbol) {
                    flushPending();
                }
                pendingMarkSymbol = markSymbol;
                pendingText += text;
            }
        }
    }
    flushPending();
    return { result: result, cost: cost };
};
exports.compareInline = function (oldVersion, newVersion, context) {
    var add = context.add, remove = context.remove;
    var separator = ' ';
    var marksTable = makeSymbolTable();
    var atomicTable = makeSymbolTable();
    var rSeq = tokenizeTextArray(oldVersion || [], marksTable, atomicTable, separator);
    var aSeq = tokenizeTextArray(newVersion || [], marksTable, atomicTable, separator);
    var diffed = diff_1.diffArrays(rSeq, aSeq, {
        comparator: compareDiffElement
    });
    var result = [];
    var cost = 0;
    for (var i = 0; i < diffed.length; i++) {
        var diffedEntry = diffed[i];
        var _a = createElementsFromDiffResult(diffedEntry.value, marksTable, atomicTable), subresult = _a.result, subcost = _a.cost;
        if (diffedEntry.added) {
            result = result.concat(subresult.map(add));
            cost += subcost;
        }
        else if (diffedEntry.removed) {
            result = result.concat(subresult.map(remove));
            cost += subcost;
        }
        else {
            result = result.concat(subresult);
        }
    }
    return { result: result, cost: cost };
};
