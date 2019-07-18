"use strict";
exports.__esModule = true;
exports["default"] = {
    citation: {
        atom: true,
        attrs: {
            value: { "default": '' },
            html: { "default": '' },
            unstructuredValue: { "default": '' },
            count: { "default": 0 }
        },
        parseDOM: [
            {
                tag: 'citation',
                getAttrs: function (node) {
                    return {
                        value: node.getAttribute('data-value') || '',
                        html: node.getAttribute('data-html') || '',
                        unstructuredValue: node.getAttribute('data-unstructured-value') || '',
                        count: Number(node.getAttribute('data-count')) ||
                            undefined
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'citation',
                {
                    'data-value': node.attrs.value,
                    'data-html': node.attrs.html,
                    'data-unstructured-value': node.attrs.unstructuredValue,
                    'data-count': node.attrs.count
                },
            ];
        },
        inline: true,
        group: 'inline',
        draggable: false
    },
    citationList: {
        atom: true,
        attrs: {
            listItems: {
                "default": []
            } /* An array of objects with the form { value: citationValue, html: citationHtml }  */
        },
        parseDOM: [{ tag: 'citationlist' }],
        toDOM: function () {
            return ['citationlist'];
        },
        inline: false,
        group: 'block',
        draggable: false
    }
};
