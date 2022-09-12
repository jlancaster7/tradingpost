import {EntityApi} from "../static/EntityApi";
import {Notification as Extensions} from "./extensions";

class NotificationApi extends EntityApi<never, never, never, never> {
    protected getFunction = '';
    protected listFunction = '';
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'NotificationApi';
    extensions = new Extensions.default(this);
}

export default new NotificationApi();