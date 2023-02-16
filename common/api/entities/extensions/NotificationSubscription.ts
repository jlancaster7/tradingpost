import Extension from "./index";
import {NotificationSubscriptionTypes} from "../../../notifications/interfaces";

export default class extends Extension {
    subscribe = this._makeFetch<{ type: NotificationSubscriptionTypes, typeId: number, disabled: boolean, data?: {} }>("subscribe", this._defaultPostRequest)
}