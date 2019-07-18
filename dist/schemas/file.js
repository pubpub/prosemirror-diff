"use strict";
exports.__esModule = true;
exports["default"] = {
    file: {
        atom: true,
        attrs: {
            url: { "default": null },
            fileName: { "default": null },
            fileSize: { "default": null },
            caption: { "default": '' }
        },
        parseDOM: [
            {
                tag: 'file',
                getAttrs: function (node) {
                    return {
                        url: node.getAttribute('data-url') || null,
                        fileName: node.getAttribute('data-fileName') || null,
                        fileSize: Number(node.getAttribute('data-fileSize')) || null,
                        caption: node.getAttribute('data-caption') || ''
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'file',
                {
                    'data-url': node.attrs.url,
                    'data-fileName': node.attrs.fileName,
                    'data-fileSize': node.attrs.fileSize,
                    'data-caption': node.attrs.caption
                },
            ];
        },
        inline: false,
        group: 'block',
        draggable: true
    }
};
