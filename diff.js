import { getTypeFromRegistry } from './registry';
// import { memoizeCompareFn } from "./memoize";

export const diffObjectSymbol = Symbol.for('isDiffObject');
const incomparable = Symbol.for('incomparable');

const add = item => {
    return {
        [diffObjectSymbol]: true,
        add: item,
    };
};

const remove = item => {
    return {
        [diffObjectSymbol]: true,
        remove: item,
    };
};

const replace = (removed, added) => {
    return {
        [diffObjectSymbol]: true,
        ...remove(removed),
        ...add(added),
    };
};

const innerDiff = (oldVersion, newVersion, registry) => {
    const compare = (ov, nv, context) => {
        if (ov.type !== nv.type) {
            return incomparable;
        }
        return getTypeFromRegistry(registry, ov.type).diff.compare(
            ov,
            nv,
            context
        );
    };

    const weight = element => {
        const resultWeight = getTypeFromRegistry(
            registry,
            element.type
        ).diff.weight(element, weight);
        if (isNaN(resultWeight)) {
            throw new Error('prosemirror-diff produced invalid element weight');
        }
        return resultWeight;
    };

    return registry.doc.diff.compare(oldVersion, newVersion, {
        add,
        remove,
        replace,
        compare,
        weight,
        incomparable,
    });
};

export const diff = (oldVersion, newVersion, registry) => {
    // const memoizedRegistry = new Map();
    // Object.entries(registry).forEach(([key, value]) => {
    //     memoizedRegistry[key] = memoizeCompareFn(value);
    // });
    return innerDiff(oldVersion, newVersion, registry).result;
};
