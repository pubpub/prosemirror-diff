import { getTypeFromRegistry } from './registry';
import { isDiffObject, incomparable } from './symbols';
import {
    Add,
    Remove,
    Replace,
    ProsemirrorDoc,
    Memoizer,
    Registry,
    CompareResult
} from './types';

const add: Add = item => {
    return {
        [isDiffObject]: true,
        add: item
    };
};

const remove: Remove = item => {
    return {
        [isDiffObject]: true,
        remove: item
    };
};

const replace: Replace = (removed, added) => {
    return {
        [isDiffObject]: true,
        ...remove(removed),
        ...add(added)
    };
};

const innerDiff = (
    oldVersion: ProsemirrorDoc,
    newVersion: ProsemirrorDoc,
    registry: Registry,
    memoizer: Memoizer
) => {
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
        memoizer
    });
};

export const diff = (oldVersion, newVersion, registry, memoizer) => {
    const { result } = innerDiff(
        oldVersion,
        newVersion,
        registry,
        memoizer
    ) as CompareResult<ProsemirrorDoc>;
    return result;
};
