export class Cache {
    constructor(options = { wipeInterval: 270 }) {
        this._map = new Map();
        setInterval(
            this.wipeExpiredCache.bind(this),
            options.wipeInterval * 1000
        );
    }

    get(key) {
        const object = this._map.get(key);
        if (object == undefined) return null;
        if (object.expires < Date.now()) {
            this.delete(key);
            return null;
        }
        return object.data;
    }
    set(
        key,
        object,
        options = {
            ttls: 60,
        }
    ) {
        const cacheObject = {
            expires: options.ttls * 1000 + Date.now(),
            data: object,
        };
        this._map.set(key, cacheObject);
    }
    delete(key) {
        this._map.delete(key);
    }
    wipeExpiredCache() {
        const now = Date.now();
        this._map.forEach((val, key) => {
            if (val.expires < now) {
                this.delete(key);
            }
        });
    }
}
