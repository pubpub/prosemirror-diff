"use strict";
exports.__esModule = true;
exports.compareByIdentity = function (oldVersion, newVersion, _a) {
    var incomparable = _a.incomparable;
    if (oldVersion === newVersion) {
        return { result: newVersion, cost: 0 };
    }
    return incomparable;
};
