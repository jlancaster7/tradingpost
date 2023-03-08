import Extension from ".";
import {IAudioGet, IAudioList} from "../interfaces";
//import { ICommentPlus } from "./Audio.server";

export default class extends Extension {
    getMostRecentUsers = this._makeFetch<{}, IAudioList[]>("getMostRecentUsers", this._defaultPostRequest)
    getMostRecentWatchlists = this._makeFetch<{}, (IAudioList & {handle: string, profile_url: string, watchlist_name: string, watchlist_note: string, symbols: string[]})[]>("getMostRecentWatchlists", this._defaultPostRequest)
    getMostRecentCompanies = this._makeFetch<{}, IAudioList[]>("getMostRecentCompanies", this._defaultPostRequest)

}

