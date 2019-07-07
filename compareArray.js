export const compareArray = (oldVersion, newVersion, context) => {
    const { compare, add, remove, weight, incomparable } = context;
    if (!oldVersion || !newVersion) {
        return incomparable;
    }
    const [firstRemoval, ...afterRemoval] = oldVersion;
    const [firstAddition, ...afterAddition] = newVersion;
    let innerCompareResult = null;
    if (firstRemoval && firstAddition) {
        const compareFirst = compare(firstRemoval, firstAddition, context);
        if (compareFirst !== incomparable) {
            const { cost: internalCost, result: internalResult } = compareFirst;
            const { result: diagonalResult, cost: diagonalCost } = compareArray(
                afterRemoval,
                afterAddition,
                context
            );
            innerCompareResult = {
                cost: internalCost + diagonalCost,
                result: [internalResult, ...diagonalResult],
            };
        }
    }
    const additionDiff =
        firstAddition && compareArray(oldVersion, afterAddition, context);
    const additionResult = additionDiff && {
        cost: weight(firstAddition) + additionDiff.cost,
        result: [add(firstAddition), ...additionDiff.result],
    };
    const removalDiff =
        firstRemoval && compareArray(afterRemoval, newVersion, context);
    const removalResult = removalDiff && {
        cost: weight(firstRemoval) + removalDiff.cost,
        result: [remove(firstRemoval), ...removalDiff.result],
    };
    return (
        [innerCompareResult, additionResult, removalResult].reduce(
            (bestCandidate, candidate) => {
                if (
                    !bestCandidate ||
                    (candidate && candidate.cost < bestCandidate.cost)
                ) {
                    return candidate;
                }
                return bestCandidate;
            },
            null
        ) || { cost: 0, result: [] }
    );
};
