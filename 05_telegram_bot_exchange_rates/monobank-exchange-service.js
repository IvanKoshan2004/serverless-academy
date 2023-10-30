import axios from "axios";
import { Cache } from "./cache.js";

export class MonobankExchangeService {
    static iso4217CurrencyCodes = [
        {
            code: 980,
            currency: "UAH",
        },
        {
            code: 840,
            currency: "USD",
        },
        {
            code: 978,
            currency: "EUR",
        },
    ];
    constructor(monobankApiKey) {
        this.monobankApiKey = monobankApiKey;
        this.cache = new Cache();
        this._cacheUpdatePromise = null;
        this._lastCacheUpdateTime = 0;
    }
    async getExchangeData(currencyA, currencyB) {
        try {
            await this._cacheUpdatePromise;
        } catch (e) {
            if ((e.response.status = 429)) {
                if (!this._cacheUpdateTooManyRequests) {
                    this._cacheUpdateTooManyRequests = true;
                    this._cacheUpdatePromise = new Promise((resolve) => {
                        setTimeout(() => {
                            this._cacheUpdateTooManyRequests = false;
                            resolve();
                        }, 60000);
                    });
                }
                return this.getExchangeData(currencyA, currencyB);
            } else {
                throw e;
            }
        }
        const key = MonobankExchangeService._createKey(currencyA, currencyB);
        const availableKeysCache = this.cache.get("availableKeys");
        if (availableKeysCache) {
            if (availableKeysCache.indexOf(key) == -1) {
                throw Error("Unavailable currency pair");
            }
            const exchangeData = this.cache.get(key);
            if (exchangeData) {
                return exchangeData;
            }
        }
        this._cacheUpdatePromise = this._updateCache();
        return this.getExchangeData(currencyA, currencyB);
    }
    async _updateCache() {
        const fetchedData = await this._fetchMonobankExchangeRates();
        const availablePairs =
            MonobankExchangeService._processApiResponse(fetchedData);
        const availableKeys = [];
        for (const pair of availablePairs) {
            this.cache.set(pair.key, pair, { ttls: 60 });
            availableKeys.push(pair.key);
        }
        this.cache.set("availableKeys", availableKeys, {
            ttls: 3600,
        });
        this._cacheUpdatePromise = null;
        this._lastCacheUpdateTime = Date.now();
    }
    async _fetchMonobankExchangeRates() {
        const request = await axios("https://api.monobank.ua/bank/currency", {
            method: "GET",
            headers: {
                "X-Token": this.monobankApiKey,
            },
        });
        return request.data;
    }
    static _processApiResponse(exchangePairs) {
        const availableCodes = MonobankExchangeService.iso4217CurrencyCodes.map(
            (el) => el.code
        );
        const availablePairs = [];
        for (const pair of exchangePairs) {
            if (
                availableCodes.indexOf(pair.currencyCodeA) != -1 &&
                availableCodes.indexOf(pair.currencyCodeB) != -1
            ) {
                const key = MonobankExchangeService._createKey(
                    MonobankExchangeService._getCurrencyFromCode(
                        pair.currencyCodeA
                    ),
                    MonobankExchangeService._getCurrencyFromCode(
                        pair.currencyCodeB
                    )
                );
                const pairExchangeObject = {
                    key: key,
                    date: pair.date,
                    rateBuy: pair.rateBuy,
                    rateCross: pair.rateCross,
                    rateSell: pair.rateSell,
                };
                availablePairs.push(pairExchangeObject);
            }
        }
        return availablePairs;
    }
    static _createKey(currencyA, currencyB) {
        return currencyA + "/" + currencyB;
    }
    static _getCodeFromCurrency(currency) {
        const codeCurrency = MonobankExchangeService.iso4217CurrencyCodes.find(
            (el) => el.currency == currency
        );
        if (codeCurrency) {
            return codeCurrency.code;
        }
        return null;
    }
    static _getCurrencyFromCode(code) {
        const codeCurrency = MonobankExchangeService.iso4217CurrencyCodes.find(
            (el) => el.code == code
        );
        if (codeCurrency) {
            return codeCurrency.currency;
        }
        return null;
    }
}
