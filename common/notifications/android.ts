import fetch from "node-fetch";
import {Message} from "./interfaces";

export default class AndroidNotifications {
    private readonly authKey: string;

    constructor(authKey: string) {
        this.authKey = authKey;
    }

    send = async (message: Message, deviceIds: string[], priority: string = "normal"): Promise<{ success: string[], failed: string[] }> => {
        let prototypeRes: { success: string[], failed: string[] } = {success: [], failed: []}
        for (let i = 0; i < deviceIds.length; i++) {
            const deviceId = deviceIds[i];
            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `key=${this.authKey}`,
                },
                body: JSON.stringify({
                    to: deviceId,
                    priority: priority,
                    notification: {
                        title: message.title,
                        body: message.body,
                    },
                }),
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || contentType.indexOf("application/json") === -1) throw new Error(await res.text())

            const body = await res.json();
            if ('error' in body.results[0]) prototypeRes.failed.push(deviceId)
            else prototypeRes.success.push(deviceId)
        }

        return prototypeRes
    }
}