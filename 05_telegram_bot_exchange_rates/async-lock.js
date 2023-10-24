export class AsyncLock {
    constructor(lockNames) {
        this._promiseMaps = new Map();
        for (const lock of lockNames) {
            this._promiseMaps.set(lock, null);
        }
        console.log;
    }
    lock(name, callback, errCallback, callbackArgs = []) {
        if (typeof callback != "function") {
            throw Error("callback should be a function");
        }
        const lock = new Promise(async (resolve, reject) => {
            try {
                const result = await callback(...callbackArgs);
                resolve(result);
            } catch (e) {
                errCallback(e);
                reject(e);
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
