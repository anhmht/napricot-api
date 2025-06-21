"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get comparePassword () {
        return comparePassword;
    },
    get hashPassword () {
        return hashPassword;
    }
});
const _bcrypt = /*#__PURE__*/ _interop_require_default(require("bcrypt"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const saltRounds = 10;
const hashPassword = async (password)=>{
    return await _bcrypt.default.hash(password, saltRounds);
};
const comparePassword = async (password, hash)=>{
    return await _bcrypt.default.compare(password, hash);
};

//# sourceMappingURL=password.js.map