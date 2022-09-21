import Extension from "./";
import {ListAlertsResponse, ListTradesResponse} from "../interfaces/index";

export default class extends Extension {
    listAlerts = this._makeFetch<{}, ListAlertsResponse[]>("listAlerts", this._defaultPostRequest)
    listTrades = this._makeFetch<{}, ListTradesResponse[]>("listTrades", this._defaultPostRequest)
}