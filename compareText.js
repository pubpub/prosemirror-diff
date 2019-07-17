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
            ]);
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
    let pendingMarks = null;
    let cost = 0;

    const flushPending = () => {
        if (pendingText.length > 0) {
            result.push({
                type: 'text',
                text: pendingText,
                marks: pendingMarks,
            });
            cost += pendingText.length;
        }
        pendingText = '';
        pendingMarks = null;
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
            if (pendingMarks === null) {
                pendingMarks = marksTable.getElementForSymbol(diffResult[0][0]);
            }
            const subtext = diffResult[i][1];
            if (subtext) {
                pendingText += subtext;
            }
        }
    }
    flushPending();
    return { result, cost };
};

export const compareText = (oldVersion, newVersion, context) => {
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

// const shouldMoveDownInDiff = (k, d, v) =>
//     k === -d || (k !== d && getVEntry(k - 1, v) < getVEntry(k + 1, v));

// const getShortestEdit = (rSeq, aSeq) => {
//     const max = rSeq.length + aSeq.length;
//     const trace = [];
//     const v = new Array(2 * max + 1);
//     setVEntry(1, v, 0);
//     for (let d = 0; d <= max; d++) {
//         trace.push([...v]);
//         for (let k = -d; k <= d; k += 2) {
//             let r = shouldMoveDownInDiff(k, d, v)
//                 ? getVEntry(k + 1, v)
//                 : getVEntry(k - 1, v) + 1;
//             let a = r - k;
//             while (r < rSeq.length && a < aSeq.length && aSeq[r] === rSeq[a]) {
//                 r++;
//                 a++;
//             }
//             setVEntry(k, v, r);
//             if (a >= aSeq.length && r >= rSeq.length) {
//                 return trace;
//             }
//         }
//     }
// };

// const backtrack = (rSeq, aSeq, shortestEdit, context) => {
//     let r = rSeq.length;
//     let a = aSeq.length;

//     const diff = [];
//     let mode = 0;
//     let pending = [];

//     const consume = (newMode, start, end, seq) => {
//         console.log('consume', newMode, seq.slice(start, end));
//         if (mode !== newMode) {
//             flushPending();
//             mode = newMode;
//         }
//         pending.unshift(seq.slice(start, end));
//     };

//     const flushPending = () => {
//         if (pending.length > 0) {
//             diff.unshift([mode, pending.reduce((a, b) => a.concat(b), [])]);
//             pending = [];
//         }
//     };

//     for (let d = shortestEdit.length - 1; d >= 0; d--) {
//         const v = shortestEdit[d];
//         const k = r - a;
//         const kPrev = shouldMoveDownInDiff(k, d, v) ? k + 1 : k - 1;
//         const rPrev = getVEntry(kPrev, v);
//         const aPrev = rPrev - kPrev;
//         while (r > rPrev && a > aPrev) {
//             consume(0, a - 1, a, aSeq);
//             r--;
//             a--;
//         }
//         if (d > 0) {
//             if (r !== rPrev) {
//                 consume(-1, rPrev, r, rSeq);
//             }
//             if (a !== aPrev) {
//                 consume(1, aPrev, a, aSeq);
//             }
//         }
//         r = rPrev;
//         a = aPrev;
//     }

//     flushPending();
//     return diff;
// };

// const getK = (k, v) => (k >= 0 ? k : v.length + k);

// const getVEntry = (k, v) => v[getK(k, v)];

// const setVEntry = (k, v, value) => {
//     v[getK(k, v)] = value;
// };
