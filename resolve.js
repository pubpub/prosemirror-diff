import { diffObjectSymbol } from './diff';
import { getTypeFromRegistry } from './registry';

const resolveArray = (
    array,
    context,
    getResolvedIndex = resolved => resolved.length
) => {
    const { resolve } = context;
    const additionsMap = new Map();
    const childAdditionsMap = new Map();
    const removalsMap = new Map();
    const childRemovalsMap = new Map();
    let accumulatedRemovals = [];
    const resolvedElements = [];
    for (let element of array) {
        const resolvedIndex = getResolvedIndex(resolvedElements);
        let resolvedElement = null;
        if (element[diffObjectSymbol]) {
            if (element.remove) {
                accumulatedRemovals.push(element.remove);
            } else if (element.add) {
                resolvedElement = element.add;
                additionsMap.set(resolvedIndex, resolvedElement);
            }
        } else {
            const resolveResult = resolve(element);
            resolvedElement =
                typeof resolveResult === 'string'
                    ? resolveResult
                    : resolveResult.element;
            if (resolveResult.removals) {
                childRemovalsMap.set(resolvedIndex, resolveResult.removals);
            }
            if (resolveResult.additions) {
                childAdditionsMap.set(resolvedIndex, resolveResult.additions);
            }
        }
        if (resolvedElement) {
            removalsMap.set(resolvedIndex, accumulatedRemovals);
            accumulatedRemovals = [];
            resolvedElements.push(resolvedElement);
        }
    }
    if (accumulatedRemovals.length) {
        removalsMap.set('end', accumulatedRemovals);
    }
    return {
        resolvedElements,
        additions: {
            map: additionsMap,
            children: childAdditionsMap,
        },
        removals: {
            map: removalsMap,
            children: childRemovalsMap,
        },
    };
};

export const resolveText = (textElement, context) => {
    const { additions, removals, resolvedElements } = resolveArray(
        textElement.text,
        context,
        elements => elements.map(x => x.length).reduce((a, b) => a + b, 0)
    );
    return {
        element: {
            ...textElement,
            text: resolvedElements.join(''),
        },
        additions: {
            text: additions,
        },
        removals: {
            text: removals,
        },
    };
};

export const resolveElementWithContent = (element, context) => {
    const { additions, removals, resolvedElements } = resolveArray(
        element.content || [],
        context
    );
    return {
        element: {
            ...element,
            // If element.content was null, don't pass in [] for resolvedElements
            content: element.content && resolvedElements,
        },
        removals: {
            content: removals,
        },
        additions: {
            content: additions,
        },
    };
};

export const resolve = (diffResult, registry) => {
    const resolve = element => {
        if (typeof element === 'string') {
            return element;
        }
        return getTypeFromRegistry(registry, element.type).render.resolve(
            element,
            { resolve }
        );
    };

    const result = resolve(diffResult);
    return {
        doc: result.element,
        additions: result.additions,
        removals: result.removals,
    };
};
