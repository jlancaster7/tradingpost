import Extension from ".";
import { ISubscriptionGet } from "../interfaces";
export default class Subscription extends Extension {
    getByUserId: (settings?: undefined) => Promise<ISubscriptionGet | null>;
}
