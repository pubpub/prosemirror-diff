export const createCompareObjects = (comparableSchema, keyHints?: [string]) => {
    const sortKeys = keyHints
        ? keys =>
              Array.from(keys).sort((a: string, b: string) => {
                  return keyHints.indexOf(a) - keyHints.indexOf(b);
              })
        : x => x;

    return (oldVersion, newVersion, context) => {
        const {
            replace,
            weight,
            incomparable,
            memoizer,
            budget = Infinity,
        } = context;

        let compareCost = 0;

        const compareObj = (innerSchema, innerOld, innerNew) => {
            const resObj = {};
            for (const key of sortKeys(
                new Set([...Object.keys(innerOld), ...Object.keys(innerNew)])
            )) {
                const oldValue = innerOld[key];
                const newValue = innerNew[key];
                const schemaAtKey = innerSchema[key];
                if (typeof schemaAtKey === 'function') {
                    // We've found a sub-key that is comparable.
                    const compared = memoizer.compare(schemaAtKey)(
                        oldValue,
                        newValue,
                        context
                    );
                    if (compared === incomparable) {
                        return incomparable;
                    }
                    const { result, cost } = compared;
                    resObj[key] = result;
                    compareCost += cost;
                    if (compareCost > budget) {
                        return incomparable;
                    }
                } else if (typeof schemaAtKey === 'object') {
                    // We need to recurse farther into the comparator.
                    const compareResult = compareObj(
                        schemaAtKey,
                        oldValue,
                        newValue
                    );
                    if (compareResult === incomparable) {
                        return incomparable;
                    }
                    resObj[key] = compareResult;
                } else {
                    resObj[key] = innerNew[key];
                }
            }
            return resObj;
        };
        const compareResult = compareObj(
            comparableSchema,
            oldVersion,
            newVersion
        );
        if (compareResult === incomparable) {
            return {
                result: replace(oldVersion, newVersion),
                cost: weight(oldVersion) + weight(newVersion),
            };
        }
        return { result: compareResult, cost: compareCost };
    };
};
