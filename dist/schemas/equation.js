"use strict";
exports.__esModule = true;
exports["default"] = {
    equation: {
        atom: true,
        attrs: {
            value: { "default": '' },
            html: { "default": '' }
        },
        parseDOM: [
            {
                tag: 'math-inline',
                getAttrs: function (node) {
                    return {
                        value: node.getAttribute('data-value') || '',
                        html: node.getAttribute('data-html') || ''
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'math-inline',
                {
                    'data-value': node.attrs.value,
                    'data-html': node.attrs.html
                },
            ];
        },
        inline: true,
        group: 'inline',
        draggable: false
    },
    block_equation: {
        atom: true,
        attrs: {
            value: { "default": '' },
            html: { "default": '' }
        },
        parseDOM: [
            {
                tag: 'math-block',
                getAttrs: function (node) {
                    return {
                        value: node.getAttribute('data-value') || '',
                        html: node.getAttribute('data-html') || ''
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'math-block',
                {
                    'data-value': node.attrs.value,
                    'data-html': node.attrs.html
                },
            ];
        },
        inline: false,
        group: 'block',
        draggable: false
    }
};
