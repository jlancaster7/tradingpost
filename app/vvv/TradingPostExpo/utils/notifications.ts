// Render message if can send notifications
// Pass along user device id to database and platform
// Should be done in Settings / Login / Sign Up(After a user creates their email / password) & its accepted
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Api } from "@tradingpost/common/api";
import * as Localization from 'expo-localization';
import { Log } from './logger';

export const registerDeviceForNotifications = async () => {
    Log.verbose("I'm trying to register a devices for notifications");
    return await Log.tryCatch(async () => {
        let token;
        Log.verbose("Checking for device")
        if (Device.isDevice) {
            if (Platform.OS === 'android') {
                console.log('setting the channel')
                await Notifications.setNotificationChannelAsync('tp-default', {
                    name: 'TradingPost Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#282869',
                });


                console.log("Setting the status");
            }
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            Log.verbose("Existing Status is:" + existingStatus);

            if (existingStatus === 'undetermined') {
                console.log("Im undetermined and requesting perms");
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log("returned")
                return;
            }




            token = await (await Notifications.getDevicePushTokenAsync()).data;
            await Api.Notification.extensions.registerUserDevice({
                provider: Platform.OS,
                deviceId: token,
                timezone: Localization.timezone
            });
        }

        console.log("TOKENENENEEN: ", token)
        return token;
    })
}