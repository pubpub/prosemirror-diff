import { diffWords } from "diff";

export const compareText = (oldVersion, newVersion, context) => {
    const {add, remove} = context;
    const diffResult = diffWords(oldVersion, newVersion);
    const result = [];
    let cost = 0;
    for (let i=0; i < diffResult.length; i++) {
        const subresult = diffResult[i];
        if (subresult.added) {
            result.push(add(subresult.value));
            cost += subresult.value.length;
        } else if (subresult.removed) {
            result.push(remove(subresult.value));
            cost += subresult.value.length
        } else {
            result.push(subresult.value);
        }
    }
    return {result, cost};
}