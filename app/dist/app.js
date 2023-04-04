"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Deps
const express_1 = __importDefault(require("express"));
const ConsistentHashingLB_1 = require("./ConsistentHashingLB");
const child_process_1 = require("child_process");
//Setup
const app = (0, express_1.default)();
for (let i = 0; i <= 1; i++) {
    (0, child_process_1.spawn)("node", [
        "/home/amado/Documents/System-Design/Express-Load-Balancer/app/dist/worker.js",
        "--port",
        `${5001 + i}`,
    ]);
}
//Test
const servers = ["http://localhost"];
const lb = new ConsistentHashingLB_1.ConsistentHashingLB({
    servers: servers,
    port: 5001,
});
app.get(/.*/, async (req, res) => {
    await lb.handler(req, res);
});
//Start Server
app.listen(5000, () => {
    console.log(`Server is starting at PORT 5000`);
});
