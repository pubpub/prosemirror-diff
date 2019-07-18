import { getTypeFromRegistry } from './registry';

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

const innerDiff = (oldVersion, newVersion, registry, memoizer) => {
    const compare = (ov, nv, context) => {
        if (ov.type !== nv.type) {
            return incomparable;
        }

        return memoizer.compare(
            getTypeFromRegistry(registry, ov.type).diff.compare
        )(ov, nv, context);
    };

    const weight = element => {
        const resultWeight = memoizer.weight(
            getTypeFromRegistry(registry, element.type).diff.weight
        )(element, weight);
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
        memoizer,
    });
};

export const diff = (oldVersion, newVersion, registry, memoizer) => {
    const { result } = innerDiff(oldVersion, newVersion, registry, memoizer);
    return result;
};
