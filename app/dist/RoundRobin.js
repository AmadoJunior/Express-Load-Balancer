"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _LBRoundRobin_servers, _LBRoundRobin_currentIndex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LBRoundRobin = void 0;
const axios_1 = __importDefault(require("axios"));
class LBRoundRobin {
    //Constructor
    constructor(options) {
        //Properties
        _LBRoundRobin_servers.set(this, void 0);
        _LBRoundRobin_currentIndex.set(this, void 0);
        __classPrivateFieldSet(this, _LBRoundRobin_servers, options.servers, "f");
        __classPrivateFieldSet(this, _LBRoundRobin_currentIndex, 0, "f");
    }
    //Methods
    async handler(req, res) {
        var _a, _b;
        const { method, url, headers, body } = req;
        const server = __classPrivateFieldGet(this, _LBRoundRobin_servers, "f")[__classPrivateFieldGet(this, _LBRoundRobin_currentIndex, "f")];
        __classPrivateFieldGet(this, _LBRoundRobin_currentIndex, "f") === __classPrivateFieldGet(this, _LBRoundRobin_servers, "f").length - 1
            ? (__classPrivateFieldSet(this, _LBRoundRobin_currentIndex, 0, "f"))
            : (__classPrivateFieldSet(this, _LBRoundRobin_currentIndex, (_b = __classPrivateFieldGet(this, _LBRoundRobin_currentIndex, "f"), _a = _b++, _b), "f"), _a);
        try {
            const response = await (0, axios_1.default)({
                url: `${server}${url}`,
                method: method,
                headers: headers,
                data: body,
            });
            res.send(response.data);
        }
        catch (err) {
            res.status(500).send("Server error!");
        }
    }
}
exports.LBRoundRobin = LBRoundRobin;
_LBRoundRobin_servers = new WeakMap(), _LBRoundRobin_currentIndex = new WeakMap();
