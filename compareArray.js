import Heap from 'heap';

const sum = arr => {
    let res = 0;
    for (let i = 0; i < arr.length; i++) {
        res += arr[i];
    }
    return res;
};

const createStateMap = () => {
    const outerMap = new Map();

    const ensuredInnerMapAtKey = k => {
        const maybeExists = outerMap.get(k);
        if (maybeExists) {
            return maybeExists;
        }
        const innerMap = new Map();
        outerMap.set(k, innerMap);
        return innerMap;
    };

    const getValueAtPosition = (a, r) => {
        return ensuredInnerMapAtKey(a).get(r);
    };

    const setValueAtPosition = (a, r, value) => {
        ensuredInnerMapAtKey(a).set(r, value);
    };

    return { getValueAtPosition, setValueAtPosition };
};

const createBestStateMap = () => {
    const { getValueAtPosition, setValueAtPosition } = createStateMap();

    const markState = state => {
        const { a, r } = state;
        setValueAtPosition(a, r, state);
    };

    const isBetterState = state => {
        const { minimumCost, a, r, result } = state;
        const currentValue = getValueAtPosition(a, r);
        return (
            !currentValue ||
            (currentValue.minimumCost > minimumCost &&
                currentValue.result.length >= result.length)
        );
    };

    return { markState, isBetterState, getValueAtPosition };
};

export const compareArray = (oldVersion = [], newVersion = [], context) => {
    const { compare, add, remove, weight, incomparable, memoizer } = context;
    const memoWeight = memoizer.weight(weight);
    const rExtent = oldVersion.length - 1;
    const aExtent = newVersion.length - 1;
    const rWeights = oldVersion.map(memoWeight);
    const aWeights = newVersion.map(memoWeight);
    const bestStateMap = createBestStateMap();
    const minimumCostMap = createStateMap();
    const heap = new Heap((a, b) => a.minimumCost - b.minimumCost);

    const makeState = (a, r, cost, result, parent) => {
        return {
            parent,
            a,
            r,
            cost,
            result,
            minimumCost: cost + getMinimumCostToGoal(a, r),
        };
    };

    const getMinimumCostToGoal = (a, r) => {
        const maybeValue = minimumCostMap.getValueAtPosition(a, r);
        if (maybeValue || maybeValue === 0) {
            // return maybeValue;
        }
        const remainingAdditionTraversal = aExtent - a;
        const remainingRemovalTraversal = rExtent - r;
        const remainingDiagonals = Math.min(
            remainingAdditionTraversal,
            remainingRemovalTraversal
        );
        const remainingAdditionsSorted = aWeights
            .slice(a + 1, aExtent + 1)
            .sort((a, b) => a - b)
            .slice(0, remainingAdditionTraversal - remainingDiagonals);
        const remainingRemovalsSorted = rWeights
            .slice(r + 1, rExtent + 1)
            .sort((a, b) => a - b)
            .slice(0, remainingRemovalTraversal - remainingDiagonals);
        const value =
            sum(remainingAdditionsSorted) + sum(remainingRemovalsSorted);
        minimumCostMap.setValueAtPosition(a, r, value);
        return value;
    };

    const getSuccessorStates = currentState => {
        const { r, a, cost, result } = currentState;
        const nextStates = [];
        const hasAnotherRemoval = r < rExtent;
        const hasAnotherAddition = a < aExtent;

        if (hasAnotherRemoval) {
            const toRemove = oldVersion[r + 1];
            const weight = rWeights[r + 1];
            const newCost = cost + weight;
            const newState = makeState(
                a,
                r + 1,
                newCost,
                [...result, remove(toRemove)],
                currentState
            );
            if (bestStateMap.isBetterState(newState)) {
                //bestStateMap.markState(newState);
                nextStates.push(newState);
            }
        }
        if (hasAnotherAddition) {
            const toAdd = newVersion[a + 1];
            const weight = aWeights[a + 1];
            const newCost = cost + weight;
            const newState = makeState(
                a + 1,
                r,
                newCost,
                [...result, add(toAdd)],
                currentState
            );
            if (bestStateMap.isBetterState(newState)) {
                //bestStateMap.markState(newState);
                nextStates.push(newState);
            }
        }
        if (hasAnotherAddition && hasAnotherRemoval) {
            const subcompare = compare(oldVersion[r + 1], newVersion[a + 1], {
                ...context,
            });
            if (subcompare !== incomparable) {
                const { cost: subcost, result: subresult } = subcompare;
                const newCost = cost + subcost;
                const newState = makeState(
                    a + 1,
                    r + 1,
                    newCost,
                    [...result, subresult],
                    currentState
                );
                if (bestStateMap.isBetterState(newState)) {
                    //bestStateMap.markState(newState);
                    nextStates.push(newState);
                }
            }
        }
        return nextStates;
    };

    heap.push(makeState(-1, -1, 0, []));

    // while (!heap.empty()) {
    //     const state = heap.pop();
    //     if (state.r === rExtent && state.a === aExtent) {
    //         return state;
    //     }
    //     getSuccessorStates(state).forEach(state => heap.push(state));
    // }
    while (!heap.empty()) {
        const firstState = heap.pop();
        const equallyMeritousStates = [firstState];
        while (
            !heap.empty() &&
            heap.peek().minimumCost === firstState.minimumCost
        ) {
            equallyMeritousStates.push(heap.pop());
        }
        for (const state of equallyMeritousStates) {
            console.log(
                equallyMeritousStates,
                state.a === aExtent,
                state.r === rExtent
            );
            if (state.r === rExtent && state.a === aExtent) {
                console.log('returning', state, rExtent, aExtent);
                return state;
            }
            getSuccessorStates(state).forEach(state => heap.push(state));
        }
    }
};

export const compareArrayOld = (oldVersion, newVersion, context) => {
    const { compare, add, remove, weight, incomparable, memoizer } = context;
    if (!oldVersion || !newVersion) {
        return incomparable;
    }
    const [firstRemoval, ...afterRemoval] = oldVersion;
    const [firstAddition, ...afterAddition] = newVersion;

    let compareResult;
    if (firstRemoval && firstAddition) {
        const compareInternal = compare(firstRemoval, firstAddition, context);
        if (compareInternal !== incomparable) {
            const {
                cost: internalCost,
                result: internalResult,
            } = compareInternal;
            const {
                result: externalResult,
                cost: externalCost,
            } = memoizer.compare(compareArray)(
                afterRemoval,
                afterAddition,
                context
            );
            compareResult = {
                cost: internalCost + externalCost,
                result: [internalResult, ...externalResult],
            };
            if (compareResult.cost === 0) {
                return compareResult;
            }
        }
    }

    let additionResult;
    if (firstAddition) {
        const weightToAdd = weight(firstAddition);
        const notWorseThanCompare =
            !compareResult || compareResult.cost > weightToAdd;
        if (notWorseThanCompare) {
            const additionDiff = memoizer.compare(compareArray)(
                oldVersion,
                afterAddition,
                context
            );
            additionResult = additionDiff && {
                cost: weightToAdd + additionDiff.cost,
                result: [add(firstAddition), ...additionDiff.result],
            };
            if (additionResult && additionResult.cost === 0) {
                return additionResult;
            }
        }
    }

    let removalResult;
    if (firstRemoval) {
        const weightToRemove = weight(firstRemoval);
        const notWorseThanAdd =
            !additionResult || additionResult.cost > weightToRemove;
        const notWorseThanCompare =
            !compareResult || compareResult.cost > weightToRemove;
        if (notWorseThanCompare && notWorseThanAdd) {
            const removalDiff = memoizer.compare(compareArray)(
                afterRemoval,
                newVersion,
                context
            );
            removalResult = removalDiff && {
                cost: weightToRemove + removalDiff.cost,
                result: [remove(firstRemoval), ...removalDiff.result],
            };
            if (removalResult && removalResult.cost === 0) {
                return removalResult;
            }
        }
    }

    return (
        [compareResult, additionResult, removalResult].reduce(
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
