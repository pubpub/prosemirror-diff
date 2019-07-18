"use strict";
exports.__esModule = true;
var prosemirror_tables_1 = require("prosemirror-tables");
var prosemirror_model_1 = require("prosemirror-model");
var pmTableNodes = prosemirror_tables_1.tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {
        background: {
            "default": null,
            getFromDOM: function (dom) {
                return dom.style.backgroundColor || null;
            },
            setDOMAttr: function (value, attrs) {
                if (value) {
                    /* eslint-disable-next-line no-param-reassign */
                    attrs.style = "(attrs.style || '') background-color: " + value + ";";
                }
            }
        }
    }
});
pmTableNodes.table.onInsert = function (view) {
    var numRows = 3;
    var numCols = 3;
    var _a = view.state, tr = _a.tr, schema = _a.schema;
    var tableType = schema.nodes.table;
    var rowType = schema.nodes.table_row;
    var cellType = schema.nodes.table_cell;
    var cellNode = cellType.createAndFill({});
    var cells = [];
    for (var i = 0; i < numCols; i += 1)
        cells.push(cellNode);
    var rowNode = rowType.create(null, prosemirror_model_1.Fragment.from(cells));
    var rows = [];
    for (var i = 0; i < numRows; i += 1)
        rows.push(rowNode);
    var tableNode = tableType.create(null, prosemirror_model_1.Fragment.from(rows));
    view.dispatch(tr.replaceSelectionWith(tableNode).scrollIntoView());
};
exports["default"] = pmTableNodes;
