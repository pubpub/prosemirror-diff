const add = (element) => {
    return {add: element, toString: () => '+' + element.toString()}
}

const remove = (element) => {
    return {remove: element, toString: () => '-' + element.toString()}
}

const diff = (oldVersion, newVersion, emptyElement) => {
    const {first: firstRemoval, rest: afterRemoval} = oldVersion.split();
    const {first: firstAddition, rest: afterAddition} = newVersion.split();
    if (firstRemoval && firstAddition) {
        const isEqual = firstRemoval.equals(firstAddition);
        const canCompare = firstRemoval.canCompareTo(firstAddition);
        if (isEqual || canCompare) {
            const {result: diagonalResult, cost: diagonalCost} = diff(afterRemoval, afterAddition, emptyElement);
            if (isEqual) {
                // We hop diagonally for free
                return {cost: diagonalCost, result: diagonalResult.prepend(firstAddition)};
            }
            if (canCompare) {
                const {cost: internalCost, result: internalResult} = diff(firstRemoval, firstAddition, emptyElement);
                return {
                    cost: diagonalCost + internalCost,
                    result: diagonalResult.prepend(internalResult),
                };
            }
        }
    }
    const additionDiff = firstAddition && diff(oldVersion, afterAddition, emptyElement);
    const additionResult = additionDiff && {
        cost: additionDiff.cost + firstAddition.getCost(),
        result: additionDiff.result.prepend(add(firstAddition)),
    };
    const removalDiff = firstRemoval && diff(afterRemoval, newVersion, emptyElement);
    const removalResult = removalDiff && {
        cost: removalDiff.cost + firstRemoval.getCost(),
        result: removalDiff.result.prepend(remove(firstRemoval)),
    };
    return [additionResult, removalResult].reduce((bestCandidate, candidate) => {
        if (!bestCandidate || (candidate && candidate.cost < bestCandidate.cost)) {
            return candidate;
        }
        return bestCandidate;
    }, null) || {cost: 0, result: emptyElement()};
}

export default diff;