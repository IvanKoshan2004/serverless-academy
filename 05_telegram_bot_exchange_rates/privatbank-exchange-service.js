import axios from "axios";

export class PrivatBankExchangeService {
    constructor() {}
    async getExchangeData(currencyA, currencyB) {
        const fetchedData = await this._fetchPrivatExchangeRates();
        const availablePairs =
            PrivatBankExchangeService._processApiResponse(fetchedData);
        const key = PrivatBankExchangeService._createKey(currencyA, currencyB);
        return availablePairs.find((pair) => pair.key == key);
    }
    async _fetchPrivatExchangeRates() {
        const request = await axios(
            "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5",
            {
                method: "GET",
            }
        );
        return request.data;
    }
    static _processApiResponse(exchangePairs) {
        const availablePairs = [];
        const fetchDate = Math.floor(Date.now() / 1000);

        for (const pair of exchangePairs) {
            const key = PrivatBankExchangeService._createKey(
                pair.ccy,
                pair.base_ccy
            );
            const pairExchangeObject = {
                key: key,
                date: fetchDate,
                rateBuy: parseFloat(pair.buy),
                rateCross: 0,
                rateSell: parseFloat(pair.sale),
            };
            availablePairs.push(pairExchangeObject);
        }
        return availablePairs;
    }
    static _createKey(currencyA, currencyB) {
        return currencyA + "/" + currencyB;
    }
}
