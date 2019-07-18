"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var diff_1 = require("./diff");
exports.diff = diff_1.diff;
var resolve_1 = require("./resolve");
exports.resolve = resolve_1.resolve;
var decorate_1 = require("./decorate");
exports.decorate = decorate_1.decorate;
__export(require("./registry"));
