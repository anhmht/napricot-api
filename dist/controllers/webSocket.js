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
    get broadcast () {
        return broadcast;
    },
    get notificationType () {
        return notificationType;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const notificationType = {
    POST: 'postNotification'
};
const broadcast = async (data)=>{
    try {
        // Deploy master branch
        await _axios.default.post(`${process.env.OPERATION_URL}/websocket/send`, {
            message: {
                ...data
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//# sourceMappingURL=webSocket.js.map