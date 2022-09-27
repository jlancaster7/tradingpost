import Extension from ".";
import {ICommentGet, ICommentList} from "../interfaces";
import { ICommentPlus } from "./Comment.server";

export default class extends Extension {
    postList = this._makeFetch<{type: string, id: string}, ICommentPlus[]>("postList", this._defaultPostRequest)

}

