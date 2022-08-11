import Extension from ".";
import { ISecurityList } from "../interfaces";

export default class extends Extension {
    list = this._makeFetch<undefined, ISecurityList[]>("list", this._defaultPostRequest)
    quickadd = this._makeFetch<{ ticker: string, add:boolean }, void>("quickadd", this._defaultPostRequest)
}