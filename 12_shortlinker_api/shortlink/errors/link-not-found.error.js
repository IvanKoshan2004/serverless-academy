export class LinkNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = LinkNotFoundError.name;
    }
}
