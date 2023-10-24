export class AsyncLock {
    constructor(lockNames) {
        this._promiseMaps = new Map();
        for (const lock of lockNames) {
            this._promiseMaps.set(lock, null);
        }
        console.log;
    }
    lock(name, callback, callbackArgs = []) {
        if (typeof callback != "function") {
            throw Error("callback should be a function");
        }
        const lock = new Promise((resolve, reject) => {
            try {
                resolve(callback(...callbackArgs));
            } catch (e) {
                reject();
            }
        });
        this._promiseMaps.set(name, lock);
        return lock;
    }
    getLock(name) {
        const lock = this._promiseMaps.get(name);
        if (lock === undefined) throw Error("lock doesn't exist");
        return lock;
    }
    isLocked(name) {
        const lock = this._promiseMaps.get(name);
        if (lock === undefined) throw Error("lock doesn't exist");
        return lock == null ? false : true;
    }
    unlock(name) {
        const lock = this._promiseMaps.get(name);
        if (lock === undefined) throw Error("lock doesn't exist");
        this._promiseMaps.set(name, null);
    }
}
