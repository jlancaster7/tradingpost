import Extension from ".";
import { ISubscriberGet, ISubscriberInsert, ISubscriberList, ISubscriptionList } from "../interfaces";

export default class Subscriber extends Extension {
    insertWithNotification = this._makeFetch<ISubscriberInsert, {}>("insertWithNotification", this._defaultPostRequest)
    getByOwner = this._makeFetch<undefined, ISubscriberList[]>("getByOwner", this._defaultPostRequest)
    getBySubscriber = this._makeFetch<undefined, ISubscriberList[]>("getBySubscriber", this._defaultPostRequest)
    removeSubscription = this._makeFetch<{ subscriptionId: number, userId?: string }, null>("removeSubscription", this._defaultPostRequest)
}