import axios from "axios";
import { Cache } from "./cache.js";

export class ExchangeService {
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
        this._apiCallLock = false;
    }
    async getExchangeData(currencyA, currencyB) {
        while (this._apiCallLock);
        const key = ExchangeService._createKey(currencyA, currencyB);
        const exchangeData = this.cache.get(key);
        if (exchangeData) {
            return exchangeData;
        }
        const availableKeysCache = this.cache.get("availableKeys");
        if (availableKeysCache) {
            if (availableKeysCache.indexOf(key) != -1) {
                if (this._apiCallLock) {
                    return this.getExchangeData(currencyA, currencyB);
                }
            } else {
                throw Error("Unavailable currency pair");
            }
        }
        if (this._apiCallLock) {
            return this.getExchangeData(currencyA, currencyB);
        }
        this._apiCallLock = true;
        const fetchedData = await this._fetchMonobankExchangeRates();
        const availablePairs = ExchangeService._processApiResponse(fetchedData);
        const availableKeys = [];
        for (const pair of availablePairs) {
            this.cache.set(pair.key, pair, { ttls: 60 });
            availableKeys.push(pair.key);
        }
        this.cache.set("availableKeys", availableKeys, { ttls: 3600 });
        this._apiCallLock = false;
        return this.cache.get(key);
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
        const availableCodes = ExchangeService.iso4217CurrencyCodes.map(
            (el) => el.code
        );
        const availablePairs = [];
        for (const pair of exchangePairs) {
            if (
                availableCodes.indexOf(pair.currencyCodeA) != -1 &&
                availableCodes.indexOf(pair.currencyCodeB) != -1
            ) {
                const key = ExchangeService._createKey(
                    ExchangeService._getCurrencyFromCode(pair.currencyCodeA),
                    ExchangeService._getCurrencyFromCode(pair.currencyCodeB)
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
        const codeCurrency = ExchangeService.iso4217CurrencyCodes.find(
            (el) => el.currency == currency
        );
        if (codeCurrency) {
            return codeCurrency.code;
        }
        return null;
    }
    static _getCurrencyFromCode(code) {
        const codeCurrency = ExchangeService.iso4217CurrencyCodes.find(
            (el) => el.code == code
        );
        if (codeCurrency) {
            return codeCurrency.currency;
        }
        return null;
    }
}
