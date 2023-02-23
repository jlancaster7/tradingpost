import fetch from "node-fetch";
import { Message } from "./interfaces";

export default class AndroidNotifications {
    private readonly authKey: string;

    constructor(authKey: string) {
        this.authKey = authKey;
    }

    send = async (message: Message, deviceIds: string[], priority: string = "normal"): Promise<{ success: string[], failed: string[] }> => {
        console.log("About to sned to android devices: " + deviceIds.join(","));
        let prototypeRes: { success: string[], failed: string[] } = { success: [], failed: [] }
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
                    data: message.data
                }),
            });


            if (res.ok) {

                const contentType = res.headers.get("content-type");
                if (!contentType || contentType.indexOf("application/json") === -1) throw new Error(await res.text())
                const body = await res.json();
                console.log(body);

                if ('error' in body.results[0]) prototypeRes.failed.push(deviceId)

                else prototypeRes.success.push(deviceId)
            }
            else {
                console.log("Android Send Status :" + res.status)
            }

        }

        return prototypeRes
    }
}