import { diffWordsWithSpace } from 'diff';
import Diff from 'text-diff';

const diff = new Diff();

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

export const compareText = (oldVersion, newVersion, context) => {
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
