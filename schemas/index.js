import { Schema } from 'prosemirror-model';

import { baseNodes, baseMarks } from './base';
import citation from './citation';
import equation from './equation';
import file from './file';
import footnote from './footnote';
import iframe from './iframe';
import image from './image';
import table from './table';
import video from './video';
import audio from './audio';
import highlightQuote from './highlightQuote';

export const defaultNodes = {
    ...baseNodes,
    ...citation,
    ...equation,
    ...file,
    ...footnote,
    ...iframe,
    ...image,
    ...table,
    ...video,
    ...audio,
    ...highlightQuote,
};

export const defaultMarks = {
    ...baseMarks,
};

export const buildSchema = (customNodes = {}, customMarks = {}) => {
    const schemaNodes = {
        ...defaultNodes,
        ...customNodes,
    };
    const schemaMarks = {
        ...defaultMarks,
        ...customMarks,
    };

    /* Filter out undefined (e.g. overwritten) nodes and marks */
    Object.keys(schemaNodes).forEach(nodeKey => {
        if (!schemaNodes[nodeKey]) {
            delete schemaNodes[nodeKey];
        }
    });
    Object.keys(schemaMarks).forEach(markKey => {
        if (!schemaMarks[markKey]) {
            delete schemaMarks[markKey];
        }
    });

    return new Schema({
        nodes: schemaNodes,
        marks: schemaMarks,
        topNode: 'doc',
    });
};
