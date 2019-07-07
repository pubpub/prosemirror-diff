import { compareArray } from "./compareArray"
import { compareText } from "./compareText";
import { createCompareObject } from "./compareObject";
import { createCompareMarks } from "./compareMarks";

const compareContent = {
    compare: {
        content: compareArray,
    },
    weight: (element, weight) => 
        element.content
            ? element.content.map(weight).reduce((a, b) => a + b)
            : 0,
};

export const baseRegistry = {
    doc: compareContent,
    paragraph: compareContent,
    bullet_list: compareContent,
    list_item: compareContent,
    text: {
        compare: {
            marks: createCompareMarks(),
            text: compareText,
        },
        weight: (element) => element.text.length
    },
};

export const buildRegistry = schema => {
    const registry = {};
    Object.entries(schema).forEach(([key, value]) => {
        registry[key] = {...value, compare: createCompareObject(value.compare)};
    });
    return registry;
}