import Extension from ".";
import { ISecurityList } from "../interfaces";

export default class extends Extension {
    list = this._makeFetch<undefined, ISecurityList[]>("list", this._defaultPostRequest)
}