//Deps
import express from "express";
import { ConsistentHashingLB } from "./ConsistentHashingLB";
import { spawn } from "child_process";

//Setup
const app = express();

//Spawn Test Workers
for (let i = 0; i <= 1; i++) {
  spawn("node", [
    "/home/amado/Documents/System-Design/Express-Load-Balancer/app/dist/worker.js",
    "--port",
    `${5001 + i}`,
  ]);
}

//Test Load Balancer
const servers = ["http://localhost:5001", "http://localhost:5002"];
const lb = new ConsistentHashingLB({
  servers: servers,
  replicas: 10,
});
app.get(/.*/, async (req, res) => {
  await lb.handler(req, res);
});

//Start Server
app.listen(5000, () => {
  console.log(`Server is starting at PORT 5000`);
});
