import Extension from ".";
import { PriceInfo } from "../../cache";
import { AllWatchlists, IWatchlistGet, IWatchlistItemList } from "../interfaces";

export type IWatchlistGetExt = Omit<IWatchlistGet, "items"> & {
    items: (IWatchlistItemList & { price: PriceInfo["price"] | null })[]
}

export default class extends Extension {
    getAllWatchlists = this._makeFetch<undefined, AllWatchlists>("getAllWatchlists", this._defaultPostRequest)
    saveWatchlist = this._makeFetch<{ id: number, is_saved: boolean }>("saveWatchlist", this._defaultPostRequest)
   
}