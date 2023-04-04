import { NextFunction as Next, Request as Req, Response as Res } from "express";

export interface Request extends Req {}
export interface Response extends Res {}
export interface NextFunction extends Next {}
