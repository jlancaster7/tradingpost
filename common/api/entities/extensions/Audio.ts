import Extension from ".";
import {IAudioGet, IAudioList, IAudioListExpanded} from "../interfaces";
//import { ICommentPlus } from "./Audio.server";

export default class extends Extension {
    getAudio = this._makeFetch<{relatedType: string, relatedId: string, limit?: number}, IAudioListExpanded[]>("getAudio", this._defaultPostRequest)
    getMostRecentUsers = this._makeFetch<{}, IAudioList[]>("getMostRecentUsers", this._defaultPostRequest)
    getMostRecentWatchlists = this._makeFetch<{}, IAudioListExpanded[]>("getMostRecentWatchlists", this._defaultPostRequest)
    getMostRecentCompanies = this._makeFetch<{}, IAudioList[]>("getMostRecentCompanies", this._defaultPostRequest)

}

