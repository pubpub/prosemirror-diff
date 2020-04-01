import { isDiffObject } from './symbols';
import { getTypeFromRegistry } from './registry';
import {
    Addition,
    ComparableEntry,
    ProsemirrorContentNode,
    Removal,
    ResolverContext,
    Resolvable,
    UnresolvedProsemirrorTextNode,
    ResolveResult,
    ProsemirrorDoc,
    ProsemirrorTextNode,
    ResolveAdditions,
    ResolveRemovals,
    Registry
} from './types';

const resolveArray = <T extends Resolvable>(
    array: ComparableEntry<Resolvable>[],
    context: ResolverContext,
    getResolvedIndex = resolved => resolved.length
) => {
    const { resolve } = context;
    const childAdditionsMap: Map<number, ResolveAdditions> = new Map();
    const childRemovalsMap: Map<number, ResolveRemovals> = new Map();
    const additionsMap: Map<number, T> = new Map();
    const removalsMap: Map<'end' | number, T[]> = new Map();
    let accumulatedRemovals: T[] = [];
    const resolvedElements = [];
    for (let element of array) {
        const resolvedIndex = getResolvedIndex(resolvedElements);
        let resolvedElement = null;
        if (element[isDiffObject]) {
            if ((element as Removal<T>).remove) {
                accumulatedRemovals.push((element as Removal<T>).remove);
            }
            if ((element as Addition<T>).add) {
                resolvedElement = (element as Addition<T>).add;
                additionsMap.set(resolvedIndex, resolvedElement);
            }
        } else {
            if (typeof element === 'string') {
                resolvedElement = element;
            } else {
                const resolveResult = resolve(element);
                resolvedElement = resolveResult.element;
                if (resolveResult.removals) {
                    childRemovalsMap.set(resolvedIndex, resolveResult.removals);
                }
                if (resolveResult.additions) {
                    childAdditionsMap.set(
                        resolvedIndex,
                        resolveResult.additions
                    );
                }
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
            children: childAdditionsMap
        },
        removals: {
            map: removalsMap,
            children: childRemovalsMap
        }
    };
};

export const resolveText = (
    textNode: UnresolvedProsemirrorTextNode,
    context: ResolverContext
): ResolveResult<ProsemirrorTextNode> => {
    const { additions, removals, resolvedElements } = resolveArray<string>(
        textNode.text,
        context,
        elements => elements.map(x => x.length).reduce((a, b) => a + b, 0)
    );
    return {
        element: {
            ...textNode,
            text: resolvedElements.join('')
        },
        additions: {
            text: additions
        },
        removals: {
            text: removals
        }
    };
};

export const resolveElementWithContent = (
    element: ProsemirrorContentNode,
    context: ResolverContext
): ResolveResult<ProsemirrorContentNode> => {
    const { additions, removals, resolvedElements } = resolveArray<
        ProsemirrorContentNode
    >(element.content || [], context);
    return {
        element: {
            ...element,
            // If element.content was null, don't pass in [] for resolvedElements
            content: element.content && resolvedElements
        },
        removals: {
            content: removals
        },
        additions: {
            content: additions
        }
    };
};

export const resolve = (diffResult: ProsemirrorDoc, registry: Registry) => {
    const resolve = element => {
        return getTypeFromRegistry(registry, element.type).render.resolve(
            element,
            { resolve }
        );
    };

    const result = resolve(diffResult);
    return {
        doc: result.element as ProsemirrorDoc,
        additions: result.additions,
        removals: result.removals
    };
};
