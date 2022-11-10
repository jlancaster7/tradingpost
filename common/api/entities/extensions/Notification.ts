import Extension from "./";
import {ListAlertsResponse, ListTradesResponse} from "../interfaces";

export default class extends Extension {
    listAlerts = this._makeFetch<{ page?: number, limit?: number }, ListAlertsResponse[]>("listAlerts", this._defaultPostRequest)
    listTrades = this._makeFetch<{ page?: number, limit?: number }, ListTradesResponse[]>("listTrades", this._defaultPostRequest)
    registerUserDevice = this._makeFetch<{ provider: string, deviceId: string, timezone: string }, {}>("registerUserDevice", this._defaultPostRequest)
    updateUserDeviceTimezone = this._makeFetch<{ deviceId: string, timezone: string }, {}>("updateUserDeviceTimezone", this._defaultPostRequest)
    seenNotifications = this._makeFetch<{ notificationIds: number[] }, {}>("seenNotifications", this._defaultPostRequest)
    hasNotifications = this._makeFetch<void, { unseenCount: number }>("hasNotifications", this._defaultPostRequest);
    updateNotification = this._makeFetch<ListAlertsResponse, void>("updateNotification", this._defaultPostRequest);
}