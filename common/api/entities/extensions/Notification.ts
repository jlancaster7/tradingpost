import Extension from "./";
import {ListAlertsResponse, ListTradesResponse} from "../interfaces";

export default class extends Extension {
    listAlerts = this._makeFetch<{ page?: number, limit?: number }, ListAlertsResponse[]>("listAlerts", this._defaultPostRequest)
    listTrades = this._makeFetch<{ page?: number, limit?: number }, ListTradesResponse[]>("listTrades", this._defaultPostRequest)
    registerUserDevice = this._makeFetch<{ provider: string, deviceId: string, timezone: string }, void>("registerUserDevice", this._defaultPostRequest)
    updateUserDeviceTimezone = this._makeFetch<{ deviceId: string, timezone: string }, void>("updateUserDeviceTimezone", this._defaultPostRequest)
}