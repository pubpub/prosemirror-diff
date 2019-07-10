export default {
    audio: {
        atom: true,
        attrs: {
            url: { default: null },
            size: { default: 50 }, // number as percentage
            align: { default: 'center' },
            caption: { default: '' },
        },
        parseDOM: [
            {
                tag: 'audio',
                getAttrs: node => {
                    return {
                        url: node.getAttribute('src') || null,
                        size: Number(node.getAttribute('data-size')) || 50,
                        align: node.getAttribute('data-align') || 'center',
                        caption: node.getAttribute('alt') || '',
                    };
                },
            },
        ],
        toDOM: node => {
            return [
                'audio',
                {
                    src: node.attrs.url,
                    'data-size': node.attrs.size,
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
