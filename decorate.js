import { Decoration, DecorationSet } from 'prosemirror-view';
import { DOMSerializer, Fragment } from 'prosemirror-model';

import { getTypeFromRegistry } from './registry';

const additionDecoration = (from, to, isBlock, addition) => {
    if (isBlock) {
        return Decoration.node(from, to, {
            class: 'prosemirror-diff-add',
            addition,
        });
    } else {
        return Decoration.inline(from, to, {
            class: 'prosemirror-diff-add',
            addition,
        });
    }
};

const removalDecoration = (position, element, serializer, schema) => {
    let getDomNode =
        typeof element === 'string'
            ? () => {
                  const span = document.createElement('span');
                  span.classList.add('prosemirror-diff-remove');
                  span.innerHTML = element;
                  return span;
              }
            : () => {
                  const node = schema.nodeFromJSON(element);
                  const wrapper = document.createElement(
                      node.isBlock ? 'div' : 'span'
                  );
                  wrapper.classList.add('prosemirror-diff-remove');
                  const domNode = serializer.serializeFragment(
                      Fragment.from(node)
                  );
                  wrapper.appendChild(domNode);
                  return wrapper;
              };
    return Decoration.widget(position, getDomNode, {
        class: 'prosemirror-diff-remove',
        removal: element,
    });
};

export const decorateText = (textElement, context) => {
    const { schema, serializer, offset, additions, removals } = context;
    const removalsMap = removals && removals.text.map;
    const additionsMap = additions && additions.text.map;
    const decorations = [];
    if (removals) {
        for (let [index, removalsHere] of removalsMap) {
            removalsHere.forEach(removal => {
                decorations.push(
                    removalDecoration(
                        -1 +
                            offset +
                            (index === 'end' ? textElement.text.length : index),
                        removal,
                        serializer,
                        schema
                    )
                );
            });
        }
    }
    if (additions) {
        for (let [index, additionHere] of additionsMap) {
            decorations.push(
                additionDecoration(
                    offset + index - 1,
                    offset + index + additionHere.length - 1,
                    false,
                    additionHere
                )
            );
        }
    }
    return decorations;
};

export const decorateNodeWithContent = (node, context) => {
    const {
        schema,
        serializer,
        offset,
        decorate,
        additions,
        removals,
    } = context;
    const removalsMap = removals && removals.content.map;
    const childRemovalsMap = removals && removals.content.children;
    const additionsMap = additions && additions.content.map;
    const childAdditionsMap = additions && additions.content.children;
    let decorations = [];

    const addRemovalDecorations = (removedItems, pos) =>
        removedItems.forEach(removal => {
            decorations.push(
                removalDecoration(pos, removal, serializer, schema)
            );
        });

    node.forEach((child, pos, index) => {
        const docPosition = offset + pos;
        const removalsHere = removalsMap && removalsMap.get(index);
        const additionHere = additionsMap && additionsMap.get(index);
        if (removalsHere && removalsHere.length > 0) {
            addRemovalDecorations(removalsHere, docPosition);
        }
        if (additionHere) {
            decorations.push(
                additionDecoration(
                    docPosition + 0,
                    docPosition + child.nodeSize + 0,
                    child.isBlock,
                    child
                )
            );
        }
        decorations = [
            ...decorations,
            ...decorate(
                child,
                docPosition + 1,
                childAdditionsMap && childAdditionsMap.get(index),
                childRemovalsMap && childRemovalsMap.get(index)
            ),
        ];
    });

    const removedAtEnd = removalsMap && removalsMap.get('end');
    if (removedAtEnd) {
        addRemovalDecorations(removedAtEnd, offset + node.nodeSize - 2);
    }

    return decorations;
};

export const decorate = (doc, schema, additions, removals, registry) => {
    const serializer = DOMSerializer.fromSchema(schema);

    const decorate = (node, offset, additions, removals) => {
        return getTypeFromRegistry(registry, node.type).render.decorate(node, {
            schema,
            serializer,
            offset,
            decorate,
            additions,
            removals,
        });
    };

    const decorations = decorate(doc, 0, additions, removals);
    return DecorationSet.create(doc, decorations);
};
