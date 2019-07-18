"use strict";
exports.__esModule = true;
exports["default"] = {
    image: {
        atom: true,
        attrs: {
            url: { "default": null },
            size: { "default": 50 },
            align: { "default": 'center' },
            caption: { "default": '' }
        },
        parseDOM: [
            {
                tag: 'img',
                getAttrs: function (node) {
                    return {
                        url: node.getAttribute('src') || null,
                        size: Number(node.getAttribute('data-size')) || 50,
                        align: node.getAttribute('data-align') || 'center',
                        caption: node.getAttribute('alt') || ''
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'img',
                {
                    src: node.attrs.url,
                    'data-size': node.attrs.size,
                    'data-align': node.attrs.align,
                    alt: node.attrs.caption
                },
            ];
        },
        inline: false,
        group: 'block',
        draggable: true
    }
};
