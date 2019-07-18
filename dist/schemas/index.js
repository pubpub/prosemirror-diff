"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var prosemirror_model_1 = require("prosemirror-model");
var base_1 = require("./base");
var citation_1 = require("./citation");
var equation_1 = require("./equation");
var file_1 = require("./file");
var footnote_1 = require("./footnote");
var iframe_1 = require("./iframe");
var image_1 = require("./image");
var table_1 = require("./table");
var video_1 = require("./video");
var audio_1 = require("./audio");
var highlightQuote_1 = require("./highlightQuote");
exports.defaultNodes = __assign({}, base_1.baseNodes, citation_1["default"], equation_1["default"], file_1["default"], footnote_1["default"], iframe_1["default"], image_1["default"], table_1["default"], video_1["default"], audio_1["default"], highlightQuote_1["default"]);
exports.defaultMarks = __assign({}, base_1.baseMarks);
exports.buildSchema = function (customNodes, customMarks) {
    if (customNodes === void 0) { customNodes = {}; }
    if (customMarks === void 0) { customMarks = {}; }
    var schemaNodes = __assign({}, exports.defaultNodes, customNodes);
    var schemaMarks = __assign({}, exports.defaultMarks, customMarks);
    /* Filter out undefined (e.g. overwritten) nodes and marks */
    Object.keys(schemaNodes).forEach(function (nodeKey) {
        if (!schemaNodes[nodeKey]) {
            delete schemaNodes[nodeKey];
        }
    });
    Object.keys(schemaMarks).forEach(function (markKey) {
        if (!schemaMarks[markKey]) {
            delete schemaMarks[markKey];
        }
    });
    return new prosemirror_model_1.Schema({
        nodes: schemaNodes,
        marks: schemaMarks,
        topNode: 'doc'
    });
};
