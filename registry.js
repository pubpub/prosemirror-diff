import { compareArray } from './compareArray';
import { compareText } from './compareText';
import { createCompareObjects } from './compareObjects';
import { createCompareMarks } from './compareMarks';
import { decorateText, decorateNodeWithContent } from './decorate';
import { resolveElementWithContent, resolveText } from './resolve';

const withContent = {
    diff: {
        compare: {
            content: compareArray,
        },
        weight: (element, weight) =>
            element.content
                ? 2 + 0.8 * element.content.map(weight).reduce((a, b) => a + b)
                : 2,
    },
    render: {
        resolve: resolveElementWithContent,
        decorate: decorateNodeWithContent,
    },
};

export const baseRegistry = {
    doc: withContent,
    paragraph: withContent,
    bullet_list: withContent,
    list_item: withContent,
    text: {
        diff: {
            compare: {
                marks: createCompareMarks(),
                text: compareText,
            },
            weight: element => element.text.length,
        },
        render: {
            resolve: resolveText,
            decorate: decorateText,
        },
    },
};

export const buildRegistry = schema => {
    const registry = {};
    Object.entries(schema).forEach(([key, value]) => {
        registry[key] = {
            ...value,
            diff: {
                ...value.diff,
                compare: createCompareObjects(value.diff.compare),
            },
        };
    });
    return registry;
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
