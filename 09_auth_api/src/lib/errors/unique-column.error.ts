export class UniqueColumnError extends Error {
    constructor(message: string) {
        super(message);
        this.name = UniqueColumnError.name;
    }
}
