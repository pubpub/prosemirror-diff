import Heap from 'heap';

const sum = arr => {
    let res = 0;
    for (let i = 0; i < res.length; i++) {
        res += arr[i];
    }
    return res;
};

let heuristicRunCount = 0;
let heuristicRunTime = 0;
let popCount = 0;

const createBestStateMap = () => {
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

    const getValue = (a, r) => {
        return ensuredInnerMapAtKey(a).get(r);
    };

    const setValueAtPosition = (a, r, value) => {
        ensuredInnerMapAtKey(a).set(r, value);
    };

    const markState = state => {
        const { a, r, cost } = state;
        for (let x = -1; x <= r; x++) {
            for (let y = -1; y <= a; y++) {
                const currentValue = getValue(x, y);
                if (!currentValue || currentValue.cost > cost) {
                    setValueAtPosition(x, y, state);
                }
            }
        }
    };

    const isContenderState = (a, r, cost) => {
        const currentValue = getValue(a, r);
        return !currentValue || currentValue.cost >= cost;
    };

    return { markState, isContenderState, getValue };
};

export const compareArray = (oldVersion = [], newVersion = [], context) => {
    const {
        compare,
        add,
        remove,
        weight,
        incomparable,
        memoizer,
        budget = Infinity,
    } = context;
    const memoWeight = memoizer.weight(weight);
    const rExtent = oldVersion.length - 1;
    const aExtent = newVersion.length - 1;
    const rWeights = oldVersion.map(memoWeight);
    const aWeights = newVersion.map(memoWeight);
    const bestStateMap = createBestStateMap();

    const heap = new Heap((a, b) => a.minimumCost - b.minimumCost);

    const makeState = (r, a, cost, result) => {
        return { r, a, cost, result, minimumCost: getMinimumCostToGoal(r, a) };
    };

    const getMinimumCostToGoal = (r, a) => {
        const h0 = window.performance.now();
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
        const res =
            sum(remainingAdditionsSorted) + sum(remainingRemovalsSorted);
        heuristicRunTime += window.performance.now() - h0;
        heuristicRunCount += 1;
        return res;
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
            if (bestStateMap.isContenderState(a, r + 1, newCost)) {
                nextStates.push(
                    makeState(a, r + 1, newCost, [...result, remove(toRemove)])
                );
            }
        }
        if (hasAnotherAddition) {
            const toAdd = newVersion[a + 1];
            const weight = aWeights[a + 1];
            const newCost = cost + weight;
            if (bestStateMap.isContenderState(a + 1, r, newCost)) {
                nextStates.push(
                    makeState(a + 1, r, newCost, [...result, add(toAdd)])
                );
            }
        }
        if (hasAnotherAddition && hasAnotherRemoval) {
            const subcompare = compare(oldVersion[r + 1], newVersion[a + 1], {
                ...context,
                budget: budget - cost,
            });
            if (subcompare !== incomparable) {
                const { cost: subcost, result: subresult } = subcompare;
                const newCost = cost + subcost;
                if (bestStateMap.isContenderState(a + 1, r + 1, newCost)) {
                    nextStates.push(
                        makeState(a + 1, r + 1, newCost, [...result, subresult])
                    );
                }
            }
        }
        return nextStates;
    };

    heap.push(makeState(-1, -1, 0, []));

    while (!heap.empty()) {
        const state = heap.pop();
        bestStateMap.markState(state);
        getSuccessorStates(state).forEach(state => heap.push(state));
    }
    return bestStateMap.getValue(aExtent, rExtent);
};

export const compareArrayNo = (oldVersion, newVersion, context) => {
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
