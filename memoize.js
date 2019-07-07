export const memoizeCompareFn = (comparable) => {
    return (memoizeMap) => (oldVersion, newVersion, ...restArgs) => {
        let innerMap = memoizeMap.get(oldVersion);
        if (!innerMap) {
            innerMap = new Map();
            memoizeMap.set(oldVersion, innerMap);
        }
        const maybeResult = innerMap.get(newVersion);
        if (maybeResult) {
            return maybeResult;
        }
        const result = comparable(oldVersion, newVersion, ...restArgs);
        innerMap.set(newVersion, result);
        return result;
    }
}