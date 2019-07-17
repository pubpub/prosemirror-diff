import { diffWordsWithSpace, diffArrays } from 'diff';
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

const getK = (k, v) => (k >= 0 ? k : v.length + k);

const getVEntry = (k, v) => v[getK(k, v)];

const setVEntry = (k, v, value) => {
    v[getK(k, v)] = value;
};

const shouldMoveDownInDiff = (k, d, v) =>
    k === -d || (k !== d && getVEntry(k - 1, v) < getVEntry(k + 1, v));

const getShortestEdit = (rSeq, aSeq) => {
    const max = rSeq.length + aSeq.length;
    const trace = [];
    const v = new Array(2 * max + 1);
    setVEntry(1, v, 0);
    for (let d = 0; d <= max; d++) {
        trace.push([...v]);
        for (let k = -d; k <= d; k += 2) {
            let r = shouldMoveDownInDiff(k, d, v)
                ? getVEntry(k + 1, v)
                : getVEntry(k - 1, v) + 1;
            let a = r - k;
            while (r < rSeq.length && a < aSeq.length && aSeq[r] === rSeq[a]) {
                r++;
                a++;
            }
            setVEntry(k, v, r);
            if (a >= aSeq.length && r >= rSeq.length) {
                return trace;
            }
        }
    }
};

const backtrack = (rSeq, aSeq, shortestEdit, context) => {
    let r = rSeq.length;
    let a = aSeq.length;

    const diff = [];
    let mode = 0;
    let pending = [];

    const consume = (newMode, start, end, seq) => {
        console.log('consume', newMode, seq.slice(start, end));
        if (mode !== newMode) {
            flushPending();
            mode = newMode;
        }
        pending.unshift(seq.slice(start, end));
    };

    const flushPending = () => {
        if (pending.length > 0) {
            diff.unshift([mode, pending.reduce((a, b) => a.concat(b), [])]);
            pending = [];
        }
    };

    for (let d = shortestEdit.length - 1; d >= 0; d--) {
        const v = shortestEdit[d];
        const k = r - a;
        const kPrev = shouldMoveDownInDiff(k, d, v) ? k + 1 : k - 1;
        const rPrev = getVEntry(kPrev, v);
        const aPrev = rPrev - kPrev;
        while (r > rPrev && a > aPrev) {
            consume(0, a - 1, a, aSeq);
            r--;
            a--;
        }
        if (d > 0) {
            if (r !== rPrev) {
                consume(-1, rPrev, r, rSeq);
            }
            if (a !== aPrev) {
                consume(1, aPrev, a, aSeq);
            }
        }
        r = rPrev;
        a = aPrev;
    }

    flushPending();
    return diff;
};

export const compareTextEh = (oldVersion, newVersion, context) => {
    console.log(oldVersion, newVersion);
    console.log(diffArrays(rSeq, aSeq));
    return { result: newVersion, cost: 0 };
};

export const compareText = (oldVersion, newVersion, context) => {
    const { add, remove } = context;
    const getSymbolForMarks = () => 0;
    const endSymbol = Symbol.for('end');
    const rSeq = tokenizeTextArray(oldVersion, getSymbolForMarks, endSymbol);
    const aSeq = tokenizeTextArray(newVersion, getSymbolForMarks, endSymbol);
    const diffResult = diffArrays(rSeq, aSeq);
    const result = [];
    let cost = 0;
    for (let i = 0; i < diffResult.length; i++) {
        const subresult = diffResult[i];
        console.log(subresult.value)
        const string = subresult.value
            .filter(x => typeof x === 'string')
            .join('');
        if (string.length) {
            const textElement = {
                type: 'text',
                text: string,
            };
            if (subresult.added) {
                result.push(add(textElement));
                cost += subresult.value.length;
            } else if (subresult.removed) {
                result.push(remove(textElement));
                cost += subresult.value.length;
            } else {
                result.push(textElement);
            }
        }
    }
    console.log(result);
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
