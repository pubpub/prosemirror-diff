"use strict";
exports.__esModule = true;
var compareArray_1 = require("./compareArray");
var compareInline_1 = require("./compareInline");
var compareObjects_1 = require("./compareObjects");
var compareByIdentity_1 = require("./compareByIdentity");
var decorate_1 = require("./decorate");
var resolve_1 = require("./resolve");
var contentWeight = function (element, weight) {
    return element.content
        ? 2 + 0.8 * element.content.map(weight).reduce(function (a, b) { return a + b; })
        : 2;
};
var contentNode = function (contentComparator) { return ({
    diff: {
        compare: compareObjects_1.createCompareObjects({
            content: contentComparator
        }),
        weight: contentWeight
    },
    render: {
        resolve: resolve_1.resolveElementWithContent,
        decorate: decorate_1.decorateNodeWithContent
    }
}); };
var leafNode = {
    diff: {
        compare: compareObjects_1.createCompareObjects({}),
        weight: function () { return 100; }
    },
    render: {
        resolve: resolve_1.resolveElementWithContent,
        decorate: decorate_1.decorateNodeWithContent
    }
};
exports.baseRegistry = {
    doc: {
        diff: {
            compare: compareObjects_1.createCompareObjects({
                content: compareArray_1.compareArray
            }),
            weight: contentWeight
        },
        render: {
            resolve: resolve_1.resolveElementWithContent,
            decorate: decorate_1.decorateNodeWithContent
        }
    },
    paragraph: contentNode(compareInline_1.compareInline),
    blockquote: contentNode(compareInline_1.compareInline),
    horizontal_rule: leafNode,
    heading: {
        diff: {
            compare: compareObjects_1.createCompareObjects({
                attrs: {
                    level: compareByIdentity_1.compareByIdentity
                },
                content: compareInline_1.compareInline
            }),
            weight: contentWeight
        },
        render: {
            resolve: resolve_1.resolveElementWithContent,
            decorate: decorate_1.decorateNodeWithContent
        }
    },
    bullet_list: contentNode(compareArray_1.compareArray),
    ordered_list: contentNode(compareArray_1.compareArray),
    code_block: contentNode(compareInline_1.compareInline),
    hard_break: leafNode,
    list_item: contentNode(compareArray_1.compareArray),
    text: {
        diff: {
            weight: function (element) { return element.text.length; }
        },
        render: {
            resolve: resolve_1.resolveText,
            decorate: decorate_1.decorateText
        }
    },
    none: leafNode,
    image: {
        diff: {
            compare: compareObjects_1.createCompareObjects({
                url: { "default": null },
                size: { "default": 50 },
                align: { "default": 'center' },
                caption: { "default": '' }
            }),
            weight: function () { return 500; }
        },
        render: {
            resolve: resolve_1.resolveElementWithContent,
            decorate: decorate_1.decorateNodeWithContent
        }
    }
};
exports.getTypeFromRegistry = function (registry, type) {
    var resolvedType = typeof type === 'object' ? type.name : type;
    if (!registry[resolvedType] || typeof registry[resolvedType] !== 'object') {
        throw new Error("prosemirror-compare registry does not have an entry for " + resolvedType);
    }
    return registry[resolvedType];
};
