import Extension from "./";
import {ISecurityList, ISecurityPrices} from "../interfaces";

export default class extends Extension {
    list = this._makeFetch<undefined, ISecurityList[]>("list", this._defaultPostRequest)
    quickadd = this._makeFetch<{ ticker: string, add: boolean }, void>("quickadd", this._defaultPostRequest)
    getPrices = this._makeFetch<{securityId: number, includeIntraday: boolean, includeHistorical: boolean, sinceDateTime?: string}, ISecurityPrices>('getPrices', this._defaultPostRequest)
}

