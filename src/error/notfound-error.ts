// src/error/not-found-error.ts
import { ResponseError } from "./response-error.js";

export class NotFoundError extends ResponseError {
  constructor(method: string, url: string) {
    super(404, `Route ${method.toUpperCase()} ${url} not found`);
    this.name = "NotFoundError";
  }
}