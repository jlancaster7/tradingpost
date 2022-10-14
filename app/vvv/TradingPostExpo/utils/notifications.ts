// Render message if can send notifications
// Pass along user device id to database and platform
// Should be done in Settings / Login / Sign Up(After a user creates their email / password) & its accepted
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';
import {Api} from "@tradingpost/common/api";
import * as Localization from 'expo-localization';


export const registerDeviceForNotifications = async () => {
    let token;
    if (Device.isDevice) {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus === 'undetermined') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return;
        }

        token = (await Notifications.getDevicePushTokenAsync()).data;
        await Api.Notification.extensions.registerUserDevice({
            provider: Platform.OS,
            deviceId: token,
            timezone: Localization.timezone
        });
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#282869',
        });
    }

    return token;
}