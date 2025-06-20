"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./User"), exports);
_export_star(require("./Category"), exports);
_export_star(require("./Product"), exports);
_export_star(require("./Post"), exports);
_export_star(require("./Link"), exports);
_export_star(require("./Thread"), exports);
_export_star(require("./Contact"), exports);
_export_star(require("./Image"), exports);
_export_star(require("./Cached"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map