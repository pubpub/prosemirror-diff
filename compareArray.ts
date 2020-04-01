import Heap from 'heap';

import { incomparable } from './symbols';
import { CompareContext } from './types';

interface State<T> {
    a: number;
    r: number;
    cost: number;
    minimumCost: number;
    parent?: State<T>;
    result: T[];
}

const sum = arr => {
    let res = 0;
    for (let i = 0; i < arr.length; i++) {
        res += arr[i];
    }
    return res;
};

const createStateMap = <V>() => {
    const outerMap: Map<number, Map<number, V>> = new Map();

    const ensuredInnerMapAtKey = (k: number) => {
        const maybeExists = outerMap.get(k);
        if (maybeExists) {
            return maybeExists;
        }
        const innerMap = new Map();
        outerMap.set(k, innerMap);
        return innerMap;
    };

    const getValueAtPosition = (a: number, r: number) => {
        return ensuredInnerMapAtKey(a).get(r);
    };

    const setValueAtPosition = (a: number, r: number, value: V) => {
        ensuredInnerMapAtKey(a).set(r, value);
    };

    return { getValueAtPosition, setValueAtPosition };
};

const createBestStateMap = <T>() => {
    const stateMap = createStateMap<State<T>>();
    const { getValueAtPosition, setValueAtPosition } = stateMap;

    const markState = (state: State<T>) => {
        const { a, r } = state;
        setValueAtPosition(a, r, state);
    };

    const isBetterState = (state: State<T>) => {
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

export const compareArray = <T>(
    oldVersion: T[] = [],
    newVersion: T[] = [],
    context: CompareContext
) => {
    const { compare, add, remove, weight } = context;
    const rExtent = oldVersion.length - 1;
    const aExtent = newVersion.length - 1;
    const rWeights = oldVersion.map(weight);
    const aWeights = newVersion.map(weight);
    const bestStateMap = createBestStateMap();
    const minimumCostMap = createStateMap();
    const heap = new Heap((a, b) => a.minimumCost - b.minimumCost);

    const getMinimumCostToGoal = (a: number, r: number) => {
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
            .sort((a: number, b: number) => a - b)
            .slice(0, remainingAdditionTraversal - remainingDiagonals);
        const remainingRemovalsSorted = rWeights
            .slice(r + 1, rExtent + 1)
            .sort((a: number, b: number) => a - b)
            .slice(0, remainingRemovalTraversal - remainingDiagonals);
        const value =
            sum(remainingAdditionsSorted) + sum(remainingRemovalsSorted);
        minimumCostMap.setValueAtPosition(a, r, value);
        return value;
    };

    const makeState = (a, r, cost, result, parent = null): State<T> => {
        return {
            parent,
            a,
            r,
            cost,
            result,
            minimumCost: cost + getMinimumCostToGoal(a, r)
        };
    };

    const getSuccessorStates = (currentState: State<T>): State<T>[] => {
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
                bestStateMap.markState(newState);
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
                bestStateMap.markState(newState);
                nextStates.push(newState);
            }
        }
        if (hasAnotherAddition && hasAnotherRemoval) {
            const subcompare = compare(oldVersion[r + 1], newVersion[a + 1], {
                ...context
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
                    bestStateMap.markState(newState);
                    nextStates.push(newState);
                }
            }
        }
        return nextStates;
    };

    heap.push(makeState(-1, -1, 0, []));

    while (!heap.empty()) {
        const firstState = heap.pop();
        const equallyMeritousStates: State<T>[] = [firstState];
        while (
            !heap.empty() &&
            heap.peek().minimumCost === firstState.minimumCost
        ) {
            equallyMeritousStates.push(heap.pop());
        }
        for (const state of equallyMeritousStates) {
            if (state.r === rExtent && state.a === aExtent) {
                return state;
            }
            getSuccessorStates(state).forEach(state => heap.push(state));
        }
    }
};
