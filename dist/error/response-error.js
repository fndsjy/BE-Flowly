export class ResponseError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
    }
}
//# sourceMappingURL=response-error.js.map