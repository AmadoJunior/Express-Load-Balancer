import { Request, Response } from "./utils/interfaces";
import axios from "axios";
import crypto from "crypto";

export interface IConsistentHashingLBOptions {
  servers: string[];
  algorithm?: string;
  replicas?: number;
  port: number;
}

export class ConsistentHashingLB {
  //Properties
  #replicas: number;
  #algorithm: string;
  #ring: Map<string, string>;
  #keys: string[];
  #nodes: string[];
  #port: number;

  //Constructor
  constructor(options: IConsistentHashingLBOptions) {
    this.#replicas = options.replicas || 2;
    this.#algorithm = options.algorithm || "md5";
    this.#ring = new Map();
    this.#keys = [];
    this.#nodes = [];
    this.#port = options.port;
    for (let server of options.servers) {
      this.addNode(server);
    }
  }

  //Methods
  addNode(node: string) {
    this.#nodes.push(node);

    for (let i = 0; i < this.#replicas; i++) {
      const key = crypto
        .createHash(this.#algorithm)
        .update(`${node}:${this.#port + i}`)
        .digest("hex");

      this.#keys.push(key);
      this.#ring[key] = `${node}:${this.#port + i}`;
    }

    this.#keys.sort();
  }

  removeNode(node: string) {
    this.#nodes.filter((value) => value !== node);

    for (let i = 0; i < this.#replicas; i++) {
      const key = crypto
        .createHash(this.#algorithm)
        .update(`${node}:${this.#port + i}`)
        .digest("hex");

      delete this.#ring[key];

      this.#keys.filter((value) => value !== key);
    }
  }

  getNodePosition(hash: string): number {
    let high = this.getRingLength() - 1;
    let low = 0;
    let idx = 0;
    let comp = 0;

    if (high == 0) return 0;

    while (low <= high) {
      idx = Math.floor((low + high) / 2);
      comp = this.compare(this.#keys[idx], hash);

      if (comp == 0) {
        return idx;
      } else if (comp > 0) {
        high = idx - 1;
      } else {
        low = idx + 1;
      }
    }

    if (high < 0) {
      high = this.getRingLength() - 1;
    }

    return high;
  }

  getNode(key: string) {
    if (this.getRingLength() == 0) return 0;

    const hash = this.crypto(key); //get hash of data/key
    const pos = this.getNodePosition(hash);

    return this.#ring[this.#keys[pos]];
  }

  async handler(req: Request, res: Response) {
    const { method, url, headers, body } = req;
    const remoteAddress =
      (req.header("x-forwarded-for") as string) || (req.ip as string);
    console.log(req.query.ip);
    const node = this.getNode(req.query.ip as string);
    try {
      const response = await axios({
        url: `${node}${url}`,
        method: method,
        headers: headers,
        data: body,
      });
      res.send(response.data);
    } catch (err) {
      res.status(500).send("Server error!");
    }
  }

  getRingLength(): number {
    return Object.keys(this.#ring).length;
  }

  compare(v1: string, v2: string): number {
    //Compare Hashes
    return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
  }

  crypto(str: string): string {
    return crypto.createHash(this.#algorithm).update(str).digest("hex");
  }
}
