"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Deps
const express_1 = __importDefault(require("express"));
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
//Setup
const port = argv.port;
const app = (0, express_1.default)();
app.get(/.*/, (req, res) => {
    res.send(`Hello World: ${port}`);
});
//Start Server
app.listen(port, () => {
    console.log(`Server is starting at PORT ${port}`);
});
