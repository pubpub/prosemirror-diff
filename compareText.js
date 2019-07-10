import { diffWords, diffChars } from 'diff';

export const compareTextWith = (oldVersion, newVersion, context, diffFn) => {
    const { add, remove } = context;
    const diffResult = diffFn(oldVersion, newVersion);
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
    const diffedWithWords = compareTextWith(
        oldVersion,
        newVersion,
        context,
        diffWords
    );
    // const diffedWithChars = compareTextWith(
    //     oldVersion,
    //     newVersion,
    //     context,
    //     diffChars
    // );
    // if (diffedWithChars.cost < diffedWithWords.cost) {
    //     return diffedWithChars;
    // }
    return diffedWithWords;
};
