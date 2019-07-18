"use strict";
exports.__esModule = true;
exports.baseNodes = {
    doc: {
        content: 'block+',
        attrs: {
            meta: { "default": {} }
        }
    },
    paragraph: {
        content: 'inline*',
        group: 'block',
        attrs: {
            "class": { "default": null }
        },
        parseDOM: [
            {
                tag: 'p',
                getAttrs: function (dom) {
                    return {
                        "class": dom.getAttribute('class')
                    };
                }
            },
        ],
        toDOM: function (node) {
            return ['p', { "class": node.attrs["class"] }, 0];
        }
    },
    blockquote: {
        content: 'block+',
        group: 'block',
        parseDOM: [{ tag: 'blockquote' }],
        toDOM: function () {
            return ['blockquote', 0];
        }
    },
    horizontal_rule: {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: function () {
            return ['div', ['hr']];
        },
        onInsert: function (view) {
            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.horizontal_rule.create()));
        }
    },
    heading: {
        attrs: {
            level: { "default": 1 },
            id: { "default": '' }
        },
        content: 'inline*',
        group: 'block',
        defining: true,
        parseDOM: [
            {
                tag: 'h1',
                getAttrs: function (dom) {
                    return { level: 1, id: dom.getAttribute('id') };
                }
            },
            {
                tag: 'h2',
                getAttrs: function (dom) {
                    return { level: 2, id: dom.getAttribute('id') };
                }
            },
            {
                tag: 'h3',
                getAttrs: function (dom) {
                    return { level: 3, id: dom.getAttribute('id') };
                }
            },
            {
                tag: 'h4',
                getAttrs: function (dom) {
                    return { level: 4, id: dom.getAttribute('id') };
                }
            },
            {
                tag: 'h5',
                getAttrs: function (dom) {
                    return { level: 5, id: dom.getAttribute('id') };
                }
            },
            {
                tag: 'h6',
                getAttrs: function (dom) {
                    return { level: 6, id: dom.getAttribute('id') };
                }
            },
        ],
        toDOM: function (node) {
            return ["h" + node.attrs.level, { id: node.attrs.id }, 0];
        }
    },
    ordered_list: {
        content: 'list_item+',
        group: 'block',
        attrs: { order: { "default": 1 } },
        parseDOM: [
            {
                tag: 'ol',
                getAttrs: function (dom) {
                    return {
                        order: dom.hasAttribute('start')
                            ? +dom.getAttribute('start')
                            : 1
                    };
                }
            },
        ],
        toDOM: function (node) {
            return [
                'ol',
                { start: node.attrs.order === 1 ? null : node.attrs.order },
                0,
            ];
        }
    },
    bullet_list: {
        content: 'list_item+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: function () {
            return ['ul', 0];
        }
    },
    list_item: {
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: function () {
            return ['li', 0];
        }
    },
    code_block: {
        content: 'text*',
        group: 'block',
        code: true,
        parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
        toDOM: function () {
            return ['pre', ['code', 0]];
        }
    },
    text: {
        inline: true,
        group: 'inline',
        toDOM: function (node) {
            return node.text;
        }
    },
    hard_break: {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: function () {
            return ['br'];
        }
    },
    none: {
        // empty schema block
        /* It's not clear to me that the none schema is used. */
        /* At the moment, it's not included in the defaultNodes prop */
        /* by default. */
        group: 'block',
        toDOM: function () {
            return ['span'];
        }
    }
};
exports.baseMarks = {
    em: {
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            {
                style: 'font-style',
                getAttrs: function (value) { return value === 'italic' && null; }
            },
        ],
        toDOM: function () {
            return ['em'];
        }
    },
    strong: {
        parseDOM: [
            { tag: 'strong' },
            // This works around a Google Docs misbehavior where
            // pasted content will be inexplicably wrapped in `<b>`
            // tags with a font-weight normal.
            {
                tag: 'b',
                getAttrs: function (node) { return node.style.fontWeight !== 'normal' && null; }
            },
            {
                style: 'font-weight',
                getAttrs: function (value) {
                    return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
                }
            },
        ],
        toDOM: function () {
            return ['strong'];
        }
    },
    link: {
        inclusive: false,
        attrs: {
            href: { "default": '' },
            title: { "default": null },
            target: { "default": null }
        },
        parseDOM: [
            {
                tag: 'a[href]',
                getAttrs: function (dom) {
                    return {
                        href: dom.getAttribute('href'),
                        title: dom.getAttribute('title'),
                        target: dom.getAttribute('target')
                    };
                }
            },
        ],
        toDOM: function (node) {
            /* Links seem to be recieving a target attr that is a dom element */
            /* coming from the wrong source in some interfaces. This ensures */
            /* only strings can be a target attr. */
            var attrs = node.attrs;
            if (attrs.target && typeof attrs.target !== 'string') {
                attrs.target = null;
            }
            return ['a', attrs];
        },
        toEditable: function () { } /* This is a workaround to make the LinkMenu function within tables */
    },
    sub: {
        parseDOM: [{ tag: 'sub' }],
        toDOM: function () {
            return ['sub'];
        }
    },
    sup: {
        parseDOM: [{ tag: 'sup' }],
        toDOM: function () {
            return ['sup'];
        }
    },
    strike: {
        parseDOM: [{ tag: 's' }, { tag: 'strike' }, { tag: 'del' }],
        toDOM: function () {
            return ['s'];
        }
    },
    code: {
        parseDOM: [{ tag: 'code' }],
        toDOM: function () {
            return ['code'];
        }
    }
};
