export default {
    footnote: {
        atom: true,
        attrs: {
            value: { default: '' },
            structuredValue: { default: '' },
            structuredHtml: { default: '' },
            count: { default: 0 },
        },
        parseDOM: [
            {
                tag: 'footnote',
                getAttrs: node => {
                    return {
                        value: node.getAttribute('data-value') || '',
                        structuredValue:
                            node.getAttribute('data-structured-value') || '',
                        structuredHtml:
                            node.getAttribute('data-structured-html') || '',
                        count: Number(node.getAttribute('data-count')) || 0,
                    };
                },
            },
            // {
            // 	style: 'mso-special-character',
            // 	priority: 60,
            // 	getAttrs: (node)=> {
            // 		console.log('node', node);
            // 		return {
            // 			value: 'wppr' || node.getAttribute('data-value') || '',
            // 			count: 99 || Number(node.getAttribute('data-count')) || 0,
            // 		};
            // 	}
            // }
        ],
        toDOM: node => {
            return [
                'footnote',
                {
                    'data-value': node.attrs.value,
                    'date-structured-value': node.attrs.structuredValue,
                    'date-structured-html': node.attrs.structuredHtml,
                    'data-count': node.attrs.count,
                },
            ];
        },
        inline: true,
        group: 'inline',
        draggable: false,
    },
    footnoteList: {
        atom: true,
        attrs: {
            listItems: {
                default: [],
            } /* An array of objects with the form { value: footnoteValue }  */,
        },
        parseDOM: [{ tag: 'footnotelist' }],
        toDOM: () => {
            return ['footnotelist'];
        },
        inline: false,
        group: 'block',
        draggable: false,
    },
};
