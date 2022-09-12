import Extension from ".";
import { ISubscriberGet, ISubscriberList, ISubscriptionList } from "../interfaces";

export default class Subscriber extends Extension {
    getByOwner = this._makeFetch<undefined, ISubscriberList[]>("getByOwner", this._defaultPostRequest)
    getBySubscriber = this._makeFetch<undefined, ISubscriberList[]>("getBySubscriber", this._defaultPostRequest)
    removeSubscription = this._makeFetch<{ subscriptionId: number }, null>("removeSubscription", this._defaultPostRequest)
}