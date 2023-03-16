import Extension from ".";
import { ISubscriberInsert, ISubscriberList } from "../interfaces";
export default class Subscriber extends Extension {
    insertWithNotification: (settings: ISubscriberInsert) => Promise<{}>;
    getByOwner: (settings?: undefined) => Promise<ISubscriberList[]>;
    getBySubscriber: (settings?: undefined) => Promise<ISubscriberList[]>;
    removeSubscription: (settings: {
        subscriptionId: number;
        userId?: string | undefined;
    }) => Promise<null>;
}
