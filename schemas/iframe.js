export default {
    iframe: {
        atom: true,
        attrs: {
            url: { default: '' },
            size: { default: 75 }, // number as percentage
            height: { default: 419 },
            align: { default: 'center' },
            caption: { default: '' },
        },
        parseDOM: [
            {
                tag: 'iframe',
                getAttrs: node => {
                    return {
                        url: node.getAttribute('src') || '',
                        size: Number(node.getAttribute('data-size')) || 75,
                        height: Number(node.getAttribute('height')) || 419,
                        align: node.getAttribute('data-align') || 'center',
                        caption: node.getAttribute('alt') || '',
                    };
                },
            },
        ],
        toDOM: node => {
            return [
                'iframe',
                {
                    src: node.attrs.url,
                    'data-size': node.attrs.size,
                    height: node.attrs.height,
                    'data-align': node.attrs.align,
                    alt: node.attrs.caption,
                },
            ];
        },
        inline: false,
        group: 'block',
        draggable: false,
    },
};
