import { diffWordsWithSpace } from 'diff';
import Diff from 'text-diff';

const diff = new Diff();

const getMarksAt = version => {
    const markLengths = version.map(el => el.text.length);
    const extent = markLengths.reduce((a, b) => a + b, -1);
    return index => {
        if (index < 0 || index > extent) {
            throw new Error('Invalid index while comparing text');
        }
        let ptr = 0;
        for (let i = 0; i < markLengths.length; i++) {
            const markLength = markLengths[i];
            if (index < ptr + markLength) {
                return version[i].marks;
            } else {
                ptr += markLength;
            }
        }
    };
};

const tokenizeElement = (textElement, getSymbolForMarks, endSymbol) => {
    return [
        getSymbolForMarks(textElement),
        ...textElement.text.split(''),
        endSymbol,
    ];
};

const tokenizeTextArray = (array, getSymbolForMarks, endSymbol) =>
    array
        .map(entry => tokenizeElement(entry, getSymbolForMarks, endSymbol))
        .reduce((a, b) => [...a, ...b], []);

const shouldMoveDownInDiff = (k, d, v) =>
    k === -d || (k !== d && v[k - 1] < v[k + 1]);

const getShortestEdit = (rSeq, aSeq) => {
    const max = rSeq.length + aSeq.length;
    const trace = [];
    const v = new Array(2 * max + 1);
    v[1] = 0;
    for (let d = 0; d <= max; d++) {
        trace.push([...v]);
        for (let k = -d; k <= d; k += 2) {
            let r = shouldMoveDownInDiff(k, d, v) ? v[k + 1] : v[k - 1] + 1;
            let a = r - k;
            while (r < rSeq.length && a < aSeq.length && aSeq[r] === rSeq[a]) {
                r++;
                a++;
            }
            v[k] = r;
            if (a >= aSeq.length && r >= rSeq.length) {
                return trace;
            }
        }
    }
};

const backtrack = (rSeq, aSeq, shortestEdit, consume) => {
    let r = rSeq.length;
    let a = aSeq.length;

    let diff = [];

    const consumeAddition = size => console.log('addition', size);
    const consumeDiagonal = size => console.log('diagonal', size);
    const consumeRemoval = size => console.log('removal', size);

    for (let d = shortestEdit.length - 1; d >= 0; d--) {
        const v = shortestEdit[d];
        const k = r - a;
        const kPrev = shouldMoveDownInDiff(k, d, v) ? k + 1 : k - 1;
        const rPrev = v[kPrev];
        const aPrev = rPrev - kPrev;
        debugger;
        const diagonalSize = Math.min(r - rPrev, a - aPrev);
        consumeDiagonal(diagonalSize);
        r -= diagonalSize;
        a -= diagonalSize;
        if (d > 0) {
            if (r === rPrev) {
                consumeAddition(a - aPrev);
            }
            if (a === aPrev) {
                consumeRemoval(r - rPrev);
            }
        }
        r = rPrev;
        a = aPrev;
    }
};

export const compareText = (oldVersion, newVersion, context) => {
    console.log(oldVersion, newVersion);
    const getSymbolForMarks = () => 0;
    const endSymbol = Symbol.for('end');
    const rSeq = tokenizeTextArray(oldVersion, getSymbolForMarks, endSymbol);
    const aSeq = tokenizeTextArray(newVersion, getSymbolForMarks, endSymbol);
    const shortestEdit = getShortestEdit(rSeq, aSeq);
    console.log(rSeq, aSeq, shortestEdit);
    backtrack(rSeq, aSeq, shortestEdit, console.log);
    return newVersion;
};

export const compareTextOld = (oldVersion, newVersion, context) => {
    if (oldVersion === newVersion) {
        return {
            result: oldVersion,
            cost: 0,
        };
    }
    const { add, remove } = context;
    const diffResult = diffWordsWithSpace(oldVersion, newVersion);
    const result = [];
    let cost = 0;
    for (let i = 0; i < diffResult.length; i++) {
        const subresult = diffResult[i];
        if (subresult.added) {
            result.push(add(subresult.value));
            cost += subresult.value.length;
        } else if (subresult.removed) {
            result.push(remove(subresult.value));
            cost += subresult.value.length;
        } else {
            result.push(subresult.value);
        }
    }
    return { result, cost };
};

export const compareTextOlder = (oldVersion, newVersion, context) => {
    if (oldVersion === newVersion) {
        return {
            result: oldVersion,
            cost: 0,
        };
    }
    const { add, remove } = context;
    const diffResult = diff.main(oldVersion, newVersion);
    diff.cleanupSemantic(diffResult);
    const result = [];
    let cost = 0;
    for (let i = 0; i < diffResult.length; i++) {
        const [status, text] = diffResult[i];
        if (status === 1) {
            result.push(add(text));
            cost += text.length;
        } else if (status === -1) {
            result.push(remove(text));
            cost += text.length;
        } else {
            result.push(text);
        }
    }
    return { result, cost };
};
