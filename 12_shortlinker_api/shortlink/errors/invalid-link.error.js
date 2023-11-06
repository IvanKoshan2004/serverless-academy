export class InvalidLinkError extends Error {
    constructor(message) {
        super(message);
        this.name = InvalidLinkError.name;
    }
}
