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
var _ConsistentHashingLB_replicas, _ConsistentHashingLB_algorithm, _ConsistentHashingLB_ring, _ConsistentHashingLB_keys, _ConsistentHashingLB_nodes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsistentHashingLB = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class ConsistentHashingLB {
    //Constructor
    constructor(options) {
        //Properties
        _ConsistentHashingLB_replicas.set(this, void 0);
        _ConsistentHashingLB_algorithm.set(this, void 0);
        _ConsistentHashingLB_ring.set(this, void 0);
        _ConsistentHashingLB_keys.set(this, void 0);
        _ConsistentHashingLB_nodes.set(this, void 0);
        __classPrivateFieldSet(this, _ConsistentHashingLB_replicas, options.replicas || 5, "f");
        __classPrivateFieldSet(this, _ConsistentHashingLB_algorithm, options.algorithm || "md5", "f");
        __classPrivateFieldSet(this, _ConsistentHashingLB_ring, new Map(), "f");
        __classPrivateFieldSet(this, _ConsistentHashingLB_keys, [], "f");
        __classPrivateFieldSet(this, _ConsistentHashingLB_nodes, [], "f");
        for (let server of options.servers) {
            this.addNode(server);
        }
    }
    //Methods
    addNode(node) {
        __classPrivateFieldGet(this, _ConsistentHashingLB_nodes, "f").push(node);
        for (let i = 0; i < __classPrivateFieldGet(this, _ConsistentHashingLB_replicas, "f"); i++) {
            const key = crypto_1.default
                .createHash(__classPrivateFieldGet(this, _ConsistentHashingLB_algorithm, "f"))
                .update(`${node}:${i}`)
                .digest("hex");
            __classPrivateFieldGet(this, _ConsistentHashingLB_keys, "f").push(key);
            __classPrivateFieldGet(this, _ConsistentHashingLB_ring, "f")[key] = `${node}`;
        }
        __classPrivateFieldGet(this, _ConsistentHashingLB_keys, "f").sort();
    }
    removeNode(node) {
        __classPrivateFieldGet(this, _ConsistentHashingLB_nodes, "f").filter((value) => value !== node);
        for (let i = 0; i < __classPrivateFieldGet(this, _ConsistentHashingLB_replicas, "f"); i++) {
            const key = crypto_1.default
                .createHash(__classPrivateFieldGet(this, _ConsistentHashingLB_algorithm, "f"))
                .update(`${node}:${i}`)
                .digest("hex");
            delete __classPrivateFieldGet(this, _ConsistentHashingLB_ring, "f")[key];
            __classPrivateFieldGet(this, _ConsistentHashingLB_keys, "f").filter((value) => value !== key);
        }
    }
    getNodePosition(hash) {
        let high = this.getRingLength() - 1;
        let low = 0;
        let idx = 0;
        let comp = 0;
        if (high == 0)
            return 0;
        while (low <= high) {
            idx = Math.floor((low + high) / 2);
            comp = this.compare(__classPrivateFieldGet(this, _ConsistentHashingLB_keys, "f")[idx], hash);
            if (comp == 0) {
                return idx;
            }
            else if (comp > 0) {
                high = idx - 1;
            }
            else {
                low = idx + 1;
            }
        }
        if (high < 0) {
            high = this.getRingLength() - 1;
        }
        return high;
    }
    getNode(key) {
        if (this.getRingLength() == 0)
            return null;
        const hash = crypto_1.default.createHash(__classPrivateFieldGet(this, _ConsistentHashingLB_algorithm, "f")).update(key).digest("hex");
        const pos = this.getNodePosition(hash);
        return __classPrivateFieldGet(this, _ConsistentHashingLB_ring, "f")[__classPrivateFieldGet(this, _ConsistentHashingLB_keys, "f")[pos]];
    }
    async handler(req, res) {
        const { method, url, headers, body } = req;
        const remoteAddress = req.header("x-forwarded-for") || req.ip;
        console.log(req.query.ip);
        const node = this.getNode(req.query.ip);
        try {
            const response = await (0, axios_1.default)({
                url: `${node}${url}`,
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
    getRingLength() {
        return Object.keys(__classPrivateFieldGet(this, _ConsistentHashingLB_ring, "f")).length;
    }
    compare(v1, v2) {
        //Compare Hashes
        return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
    }
}
exports.ConsistentHashingLB = ConsistentHashingLB;
_ConsistentHashingLB_replicas = new WeakMap(), _ConsistentHashingLB_algorithm = new WeakMap(), _ConsistentHashingLB_ring = new WeakMap(), _ConsistentHashingLB_keys = new WeakMap(), _ConsistentHashingLB_nodes = new WeakMap();
