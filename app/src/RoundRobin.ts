import { Request, Response } from "./utils/interfaces";
import axios from "axios";

export interface ILBRoundRobinOptions {
  servers: string[];
}

export class LBRoundRobin {
  //Properties
  #servers: string[];
  #currentIndex: number;

  //Constructor
  constructor(options: ILBRoundRobinOptions) {
    this.#servers = options.servers;
    this.#currentIndex = 0;
  }

  //Methods
  async handler(req: Request, res: Response) {
    const { method, url, headers, body } = req;

    const server = this.#servers[this.#currentIndex];

    this.#currentIndex === this.#servers.length - 1
      ? (this.#currentIndex = 0)
      : this.#currentIndex++;

    try {
      const response = await axios({
        url: `${server}${url}`,
        method: method,
        headers: headers,
        data: body,
      });
      res.send(response.data);
    } catch (err) {
      res.status(500).send("Server error!");
    }
  }
}
