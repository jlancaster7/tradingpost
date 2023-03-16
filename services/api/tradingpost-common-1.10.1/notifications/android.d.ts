import { Message } from "./interfaces";
export default class AndroidNotifications {
    private readonly authKey;
    constructor(authKey: string);
    send: (message: Message, deviceIds: string[], priority?: string) => Promise<{
        success: string[];
        failed: string[];
    }>;
}
