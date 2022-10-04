import Extension from "./";
import {ListAlertsResponse, ListTradesResponse} from "../interfaces";

export default class extends Extension {
    listAlerts = this._makeFetch<{page?: number, limit?: number}, ListAlertsResponse[]>("listAlerts", this._defaultPostRequest)
    listTrades = this._makeFetch<{}, ListTradesResponse[]>("listTrades", this._defaultPostRequest)
}