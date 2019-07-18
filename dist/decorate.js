"use strict";
exports.__esModule = true;
var prosemirror_view_1 = require("prosemirror-view");
var prosemirror_model_1 = require("prosemirror-model");
var registry_1 = require("./registry");
var additionDecoration = function (from, to, isBlock, addition) {
    if (isBlock) {
        return prosemirror_view_1.Decoration.node(from, to, {
            "class": 'prosemirror-diff-add',
            addition: addition
        });
    }
    else {
        return prosemirror_view_1.Decoration.inline(from, to, {
            "class": 'prosemirror-diff-add',
            addition: addition
        });
    }
};
var removalDecoration = function (position, element, serializer, schema) {
    var getDomNode = typeof element === 'string'
        ? function () {
            var span = document.createElement('span');
            span.classList.add('prosemirror-diff-remove');
            span.innerHTML = element;
            return span;
        }
        : function () {
            var node = schema.nodeFromJSON(element);
            var wrapper = document.createElement(node.isBlock ? 'div' : 'span');
            wrapper.classList.add('prosemirror-diff-remove');
            var domNode = serializer.serializeFragment(prosemirror_model_1.Fragment.from(node));
            wrapper.appendChild(domNode);
            return wrapper;
        };
    return prosemirror_view_1.Decoration.widget(position, getDomNode, {
        "class": 'prosemirror-diff-remove',
        removal: element
    });
};
exports.decorateText = function (textElement, context) {
    var schema = context.schema, serializer = context.serializer, offset = context.offset, additions = context.additions, removals = context.removals;
    var removalsMap = removals && removals.text.map;
    var additionsMap = additions && additions.text.map;
    var decorations = [];
    if (removals) {
        var _loop_1 = function (index, removalsHere) {
            removalsHere.forEach(function (removal) {
                decorations.push(removalDecoration(-1 +
                    offset +
                    (index === 'end' ? textElement.text.length : index), removal, serializer, schema));
            });
        };
        for (var _i = 0, removalsMap_1 = removalsMap; _i < removalsMap_1.length; _i++) {
            var _a = removalsMap_1[_i], index = _a[0], removalsHere = _a[1];
            _loop_1(index, removalsHere);
        }
    }
    if (additions) {
        for (var _b = 0, additionsMap_1 = additionsMap; _b < additionsMap_1.length; _b++) {
            var _c = additionsMap_1[_b], index = _c[0], additionHere = _c[1];
            decorations.push(additionDecoration(offset + index - 1, offset + index + additionHere.length - 1, false, additionHere));
        }
    }
    return decorations;
};
exports.decorateNodeWithContent = function (node, context) {
    var schema = context.schema, serializer = context.serializer, offset = context.offset, decorate = context.decorate, additions = context.additions, removals = context.removals;
    var removalsMap = removals && removals.content.map;
    var childRemovalsMap = removals && removals.content.children;
    var additionsMap = additions && additions.content.map;
    var childAdditionsMap = additions && additions.content.children;
    var decorations = [];
    var addRemovalDecorations = function (removedItems, pos) {
        return removedItems.forEach(function (removal) {
            decorations.push(removalDecoration(pos, removal, serializer, schema));
        });
    };
    node.forEach(function (child, pos, index) {
        var docPosition = offset + pos;
        var removalsHere = removalsMap && removalsMap.get(index);
        var additionHere = additionsMap && additionsMap.get(index);
        if (removalsHere && removalsHere.length > 0) {
            addRemovalDecorations(removalsHere, docPosition);
        }
        if (additionHere) {
            decorations.push(additionDecoration(docPosition + 0, docPosition + child.nodeSize + 0, child.isBlock, child));
        }
        decorations = decorations.concat(decorate(child, docPosition + 1, childAdditionsMap && childAdditionsMap.get(index), childRemovalsMap && childRemovalsMap.get(index)));
    });
    var removedAtEnd = removalsMap && removalsMap.get('end');
    if (removedAtEnd) {
        addRemovalDecorations(removedAtEnd, offset + node.nodeSize - 2);
    }
    return decorations;
};
exports.decorate = function (doc, schema, additions, removals, registry) {
    var serializer = prosemirror_model_1.DOMSerializer.fromSchema(schema);
    var decorate = function (node, offset, additions, removals) {
        return registry_1.getTypeFromRegistry(registry, node.type).render.decorate(node, {
            schema: schema,
            serializer: serializer,
            offset: offset,
            decorate: decorate,
            additions: additions,
            removals: removals
        });
    };
    var decorations = decorate(doc, 0, additions, removals);
    return prosemirror_view_1.DecorationSet.create(doc, decorations);
};
