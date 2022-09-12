import Extension from ".";
import { ISubscriptionGet } from "../interfaces";

export default class Subscription extends Extension {
    getByUserId = this._makeFetch<undefined, ISubscriptionGet | null>("getByUserId", this._defaultPostRequest)
}