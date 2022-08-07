import { IWatchlistList } from "../interfaces";
import { ensureServerExtensions, Extension } from "./index"

export type UploadProfilePicBody = { userId: string, image: string };

export default class User extends Extension {
    uploadProfilePic = this._makeFetch<UploadProfilePicBody, void>("uploadProfilePic", this._defaultPostRequest)
    generateBrokerageLink = this._makeFetch<undefined, { link: string }>("generateBrokerageLink", this._defaultPostRequest)
    getBrokerageAccounts = this._makeFetch<undefined, { id: number, broker_name: string, account_number: string, user_id: string }[]>("getBrokerageAccounts", this._defaultPostRequest)
    initBrokerageAccounts = this._makeFetch<undefined, {}[]>("initBrokerageAccounts", this._defaultPostRequest)
    linkSocialAccount = this._makeFetch<{ platform: string, code: string, challenge: string }, string>("linkSocialAccount", this._defaultPostRequest)
    getTrades = this._makeFetch<undefined, { date: Date, type: string, quantity: number, price: number, fees: number, currency: string, security_id: number }[]>("getTrades", this._defaultPostRequest)
    getHoldings = this._makeFetch<undefined, { id: number, price_as_of: Date, quantity: number, price: number, value: number, cost_basis: number, security_id: number }[]>("getHoldings", this._defaultPostRequest)
    getWatchlists = this._makeFetch<{userId:string},IWatchlistList[]>("getWatchlists", this._defaultPostRequest)
}
