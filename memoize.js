const updateAndGetStringify = (object, stringifyMap) => {
    if (stringifyMap.get(object)) {
        return stringifyMap.get(object);
    } else {
        const string = JSON.stringify(object);
        stringifyMap.set(object, string);
        return string;
    }
};

export const memoizeCompareFn = (
    compare,
    { compareMap, stringifyMap, recordHit, recordMiss }
) => (oldVersion, newVersion, ...restArgs) => {
    const oldString = updateAndGetStringify(oldVersion, stringifyMap);
    const newString = updateAndGetStringify(newVersion, stringifyMap);
    let innerMap = compareMap.get(oldString);
    if (!innerMap) {
        innerMap = new Map();
        compareMap.set(oldString, innerMap);
    }
    const maybeResult = innerMap.get(newString);
    if (maybeResult) {
        recordHit();
        return maybeResult;
    }
    recordMiss();
    const result = compare(oldVersion, newVersion, ...restArgs);
    innerMap.set(newString, result);
    return result;
};

export const memoizeWeightFn = (
    weight,
    { weightMap, stringifyMap, recordHit, recordMiss }
) => (element, ...restArgs) => {
    const elementString = updateAndGetStringify(element, stringifyMap);
    const mapValue = weightMap.get(elementString);
    if (mapValue) {
        recordHit();
        return mapValue;
    } else {
        recordMiss();
        const result = weight(element, ...restArgs);
        weightMap.set(elementString, result);
        return result;
    }
};

const makeMemoStore = () => {
    let hits = 0;
    let misses = 0;
    return {
        weightMap: new Map(),
        compareMap: new Map(),
        stringifyMap: new Map(),
        recordHit: () => {
            hits += 1;
        },
        recordMiss: () => {
            misses += 1;
        },
        getHitRate: () => {
            if (misses === 0) {
                return 0;
            }
            return hits / (hits + misses);
        },
        clearHitRate: () => {
            hits = 0;
            misses = 0;
        },
    };
};

export const makeMemoizer = () => {
    const store = makeMemoStore();

    const makeMemoize = memoizingFn => fn => {
        const fnMap = new Map();
        const memoized = fnMap.get(fn);
        if (memoized) {
            return memoized;
        }
        const memoizedHere = memoizingFn(fn, store);
        fnMap.set(fn, memoizedHere);
        return memoizedHere;
    };

    return {
        compare: makeMemoize(memoizeCompareFn),
        weight: makeMemoize(memoizeWeightFn),
        getHitRate: store.getHitRate,
        clearHitRate: store.clearHitRate,
    };
};
