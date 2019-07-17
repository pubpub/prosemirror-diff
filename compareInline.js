import { diffArrays } from 'diff';

import { passThroughStringifyMap } from './memoize';

const makeSymbolTable = () => {
    const stringifyMap = new Map();
    const stringToSymbolMap = new Map();
    const symbolToElementMap = new Map();

    const getSymbolForElement = element => {
        const string = passThroughStringifyMap(element, stringifyMap);
        const maybeResult = stringToSymbolMap.get(string);
        if (maybeResult) {
            return maybeResult;
        }
        const newSymbol = Symbol.for(string);
        stringToSymbolMap.set(string, newSymbol);
        symbolToElementMap.set(newSymbol, element);
        return newSymbol;
    };

    const getElementForSymbol = symbol => {
        return symbolToElementMap.get(symbol);
    };

    return {
        getSymbolForElement,
        getElementForSymbol,
    };
};

const tokenizeElement = (element, marksTable, atomicTable, separator) => {
    const symbol = marksTable.getSymbolForElement(element.marks);
    if (element.type === 'text') {
        return element.text
            .split(separator)
            .map((text, i, arr) => [
                symbol,
                text + (i === arr.length - 1 ? '' : separator),
            ])
            .filter(entry => entry[1] !== '');
    }
    return [atomicTable.getSymbolForElement(element)];
};

const tokenizeTextArray = (array, marksTable, atomicTable, separator) =>
    array
        .map(entry =>
            tokenizeElement(entry, marksTable, atomicTable, separator)
        )
        .reduce((a, b) => [...a, ...b], []);

const compareDiffElement = (left, right) => {
    if (left === right) {
        return true;
    } else {
        return left[0] === right[0] && left[1] === right[1];
    }
};

const createElementsFromDiffResult = (diffResult, marksTable, atomicTable) => {
    const result = [];
    let pendingText = '';
    let pendingMarkSymbol = null;
    let cost = 0;

    const flushPending = () => {
        if (pendingText.length > 0) {
            result.push({
                type: 'text',
                text: pendingText,
                marks: marksTable.getElementForSymbol(pendingMarkSymbol),
            });
            cost += pendingText.length;
        }
        pendingText = '';
        pendingMarkSymbol = null;
    };

    for (let i = 0; i < diffResult.length; i++) {
        const item = diffResult[i];
        if (typeof item === 'symbol') {
            flushPending();
            const maybeAtomic = atomicTable.getElementForSymbol(item);
            if (maybeAtomic) {
                result.push(maybeAtomic);
            } else {
                throw new Error('Missing symbol for element');
            }
        } else {
            const [markSymbol, text] = diffResult[i];
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
    return { result, cost };
};

export const compareInline = (oldVersion, newVersion, context) => {
    const { add, remove } = context;
    const separator = ' ';
    const marksTable = makeSymbolTable();
    const atomicTable = makeSymbolTable();
    const rSeq = tokenizeTextArray(
        oldVersion || [],
        marksTable,
        atomicTable,
        separator
    );
    const aSeq = tokenizeTextArray(
        newVersion || [],
        marksTable,
        atomicTable,
        separator
    );
    const diffed = diffArrays(rSeq, aSeq, {
        comparator: compareDiffElement,
    });
    let result = [];
    let cost = 0;
    for (let i = 0; i < diffed.length; i++) {
        const diffedEntry = diffed[i];
        const {
            result: subresult,
            cost: subcost,
        } = createElementsFromDiffResult(
            diffedEntry.value,
            marksTable,
            atomicTable
        );
        if (diffedEntry.added) {
            result = [...result, ...subresult.map(add)];
            cost += subcost;
        } else if (diffedEntry.removed) {
            result = [...result, ...subresult.map(remove)];
            cost += subcost;
        } else {
            result = [...result, ...subresult];
        }
    }
    return { result, cost };
};
