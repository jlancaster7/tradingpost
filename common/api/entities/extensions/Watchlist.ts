import Extension from ".";
import {PriceInfo} from "../../cache";
import {AllWatchlists, IWatchlistGet, IWatchlistItemList, IWatchlistList} from "../interfaces";

export type IWatchlistGetExt = Omit<IWatchlistGet, "items"> & {
    items: (IWatchlistItemList & { price: PriceInfo["price"] | null })[]
}

export default class extends Extension {
    getAllWatchlists = this._makeFetch<undefined, AllWatchlists>("getAllWatchlists", this._defaultPostRequest)
    getPublicWatchlists = this._makeFetch<{page: number, limit: number}, {id: number, name: string, symbolList: string[], type: string, isNotification: boolean, userHandle: string, userImageUri?: string}[]>("getPublicWatchlists", this._defaultPostRequest)
    saveWatchlist = this._makeFetch<{ id: number, is_saved: boolean }, {id: number, is_saved: boolean}>("saveWatchlist", this._defaultPostRequest)
    toggleNotification= this._makeFetch<{ id: number, is_notification: boolean }, boolean>("toggleNotification", this._defaultPostRequest)
}