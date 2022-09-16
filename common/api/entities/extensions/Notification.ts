import Extension from "./index";

export type ListAlertsResponse = {
    id: number
    type: string
    dateTime: string
    data: Record<string, any>
}

export default class extends Extension {
    listAlerts = this._makeFetch<{}, ListAlertsResponse[]>("listAlerts", this._defaultPostRequest)
}