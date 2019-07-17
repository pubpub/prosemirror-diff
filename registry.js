import { compareArray } from './compareArray';
import { compareText } from './compareText';
import { createCompareObjects } from './compareObjects';
import { compareByIdentity } from './compareByIdentity';
import { decorateText, decorateNodeWithContent } from './decorate';
import { resolveText, resolveElementWithContent } from './resolve';

const contentWeight = (element, weight) =>
    element.content
        ? 2 + 0.8 * element.content.map(weight).reduce((a, b) => a + b)
        : 2;

const contentNode = {
    diff: {
        compare: createCompareObjects({
            content: compareText,
        }),
        weight: contentWeight,
    },
    render: {
        resolve: resolveElementWithContent,
        decorate: decorateNodeWithContent,
    },
};

const leafNode = {
    diff: {
        compare: createCompareObjects({}),
        weight: () => 100,
    },
    render: {
        resolve: resolveElementWithContent,
        decorate: decorateNodeWithContent,
    },
};

export const baseRegistry = {
    doc: {
        diff: {
            compare: createCompareObjects({
                content: compareArray,
            }),
            weight: contentWeight,
        },
        render: {
            resolve: resolveElementWithContent,
            decorate: decorateNodeWithContent,
        },
    },
    paragraph: contentNode,
    blockquote: contentNode,
    horizontal_rule: leafNode,
    heading: {
        diff: {
            compare: createCompareObjects({
                attrs: {
                    level: compareByIdentity,
                },
                content: compareText,
            }),
            weight: contentWeight,
        },
        render: {
            resolve: resolveElementWithContent,
            decorate: decorateNodeWithContent,
        },
    },
    bullet_list: contentNode,
    ordered_list: contentNode,
    code_block: contentNode,
    hard_break: leafNode,
    list_item: contentNode,
    text: {
        diff: {
            weight: element => element.text.length,
        },
        render: {
            resolve: resolveText,
            decorate: decorateText,
        },
    },
    none: leafNode,
    image: {
        diff: {
            compare: createCompareObjects({
                url: { default: null },
                size: { default: 50 }, // number as percentage
                align: { default: 'center' },
                caption: { default: '' },
            }),
            weight: () => 500,
        },
        render: {
            resolve: resolveElementWithContent,
            decorate: decorateNodeWithContent,
        },
    },
};

export const getTypeFromRegistry = (registry, type) => {
    const resolvedType = typeof type === 'object' ? type.name : type;
    if (!registry[resolvedType] || typeof registry[resolvedType] !== 'object') {
        throw new Error(
            `prosemirror-compare registry does not have an entry for ${resolvedType}`
        );
    }
    return registry[resolvedType];
};
