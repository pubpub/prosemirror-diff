export const createCompareObject = (comparableSchema) => {
    return (oldVersion, newVersion, context) => {
        const {add, remove, weight, incomparable} = context;
        let compareCost = 0;
        const compareObj = (innerSchema, innerOld, innerNew) => {
            const resObj = {};
            for(const key of Object.keys(innerOld)) {
                const oldValue = innerOld[key];
                const newValue = innerNew[key];
                const schemaAtKey = innerSchema[key];
                if (typeof schemaAtKey === 'function') {
                    // We've found a sub-key that is comparable.
                    const compared = schemaAtKey(oldValue, newValue, context);
                    if (compared === incomparable) {
                        return incomparable
                    }
                    const {result, cost} = compared;
                    resObj[key] = result;
                    compareCost += cost;
                } else if (typeof schemaAtKey === 'object') {
                    // We need to recurse farther into the comparator.
                    const compareResult = compareObj(schemaAtKey, oldValue, newValue);
                    if (compareResult === incomparable) {
                        return incomparable;
                    }
                    resObj[key] = compareResult;
                } else {
                    resObj[key] = innerNew[key];
                }
            }
            return resObj;
        }
        const compareResult = compareObj(comparableSchema, oldVersion, newVersion);
        if (compareResult === incomparable) {
            return {
                result: [remove(oldVersion), add(newVersion)],
                cost: weight(oldVersion) + weight(newVersion),
            };
        }
        return {result: compareResult, cost: compareCost};
    }
}