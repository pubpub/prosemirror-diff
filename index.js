import { buildRegistry, baseRegistry } from './registry';
// import { memoizeCompareFn } from "./memoize";

const incomparable = Symbol.for('incomparable');

const add = item => {
    return {
        add: item,
    };
};

const remove = item => {
    return {
        remove: item,
    };
};

const maybeThrowTypeError = (type, registry) => {
    if (!registry[type] || typeof registry[type] !== 'object') {
        throw new Error(
            `prosemirror-compare registry does not know how to compare ${type}`
        );
    }
};

const innerDiff = (oldVersion, newVersion, registry) => {
    const compare = (oldVersion, newVersion, context) => {
        if (oldVersion.type !== newVersion.type) {
            return incomparable;
        }
        maybeThrowTypeError(oldVersion.type, registry);
        return registry[oldVersion.type].compare(
            oldVersion,
            newVersion,
            context
        );
    };

    const weight = element => {
        maybeThrowTypeError(element.type, registry);
        const resultWeight = registry[element.type].weight(element, weight);
        if (isNaN(resultWeight)) {
            throw new Error('prosemirror-diff produced invalid element weight');
        }
        return resultWeight;
    };

    return registry.doc.compare(oldVersion, newVersion, {
        add,
        remove,
        compare,
        weight,
        incomparable,
    });
};

export const diff = (
    oldVersion,
    newVersion,
    registry = buildRegistry(baseRegistry)
) => {
    // const memoizedRegistry = new Map();
    // Object.entries(registry).forEach(([key, value]) => {
    //     memoizedRegistry[key] = memoizeCompareFn(value);
    // });
    return innerDiff(oldVersion, newVersion, registry);
};
