//Deps
import express from "express";
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

//Setup
const port = argv.port;
const app = express();

app.get(/.*/, (req, res) => {
  res.send(`Hello World: ${port}`);
});

//Start Server
app.listen(port, () => {
  console.log(`Server is starting at PORT ${port}`);
});
