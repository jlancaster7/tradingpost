/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { getActionFromState, getStateFromPath, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { NavIconKeys, navIcons } from '../images';
import { screens } from '../screens/CreateAccountScreen';
import * as Notifications from 'expo-notifications';
import { Log } from '../utils/logger';

const ConfigOverride: Partial<Record<NavIconKeys, any>> = {
    Notification: {
        path: "dash/notification",
    }
};



const linking: LinkingOptions<any> = {
    prefixes: [Linking.createURL('/'), "https://m.tradingpostapp.com"],
    config: {
        screens: {
            Root: "login",
            Create: {
                screens: {
                    Root: {
                        screens: (() => {
                            const output: Record<string, string> = {}
                            Object.keys(screens).map((k) => {
                                output[k] = "create/" + k.toLowerCase();
                            })
                            return output;
                        })()
                    }
                }
            },
            Dash: {
                screens: {
                    Root: {
                        screens: (() => {
                            const output: Record<string, string> = {}
                            Object.keys(navIcons).map((k) => {
                                output[k] = ConfigOverride[k as NavIconKeys] || "dash/" + k.toLowerCase();
                            })
                            return output;
                        })()
                    }
                }
            },
            BlockedUsers: "blocked",
            Profile: "profile",
            PostScreen: "post",
            AccountInformation: "account",
            VerifyAccount: "verifyaccount",
            ResetPassword: "resetpassword",
            NotificationTrade: "dash/notification/trade",
            Auth: "auth/:platform",
            WatchlistViewer: "WatchlistViewer/:watchlistId",
            Modal: 'modal',
            NotFound: '*',
        },
    },
    getStateFromPath: (path, options) => {
        const state = getStateFromPath(path, options);
        // Replaces the current screen if $replace is in the parameter
        // ...not sure if this will work properly in all navigation situations
        // maybe need to make this only work if the navigator is a dash? or look for the last dash navigator
        if (state && (state.routes?.[state.routes.length - 1]?.params as any)?.$replace && state.routes.length > 1) {
            console.log("Running a replace ....");
            delete (state.routes?.[state.routes.length - 1]?.params as any).$replace;
            state.routes.splice(state.routes.length - 2, 1);
        }

        return state;

    },
    getActionFromState: (state, options) => {
        return getActionFromState(state, options);
    },
    async getInitialURL() {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response && response.notification) {
            let url = null;
            if ('remoteMessage' in response.notification.request.trigger) {
                url = response.notification?.request?.trigger?.remoteMessage?.data?.url as string;
            } else if ('payload' in response.notification.request.trigger) {
                url = response.notification?.request?.trigger?.payload?.url as string;
            }
            if (url) return url;
        }
 
        return await Linking.getInitialURL();
    },
    subscribe(listener) {
        const onReceiveURL = ({ url }: { url: string }) => listener(url);
        Log.verbose("Subscribe happening");
        // Listen to incoming links from deep linking
        Linking.addEventListener('url', onReceiveURL);
        // Listen to expo push notifications
        //Notifications.setNotificationChannelAsync("default");


        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            let url = null;
            console.log("I'm reading the notificaion")
            console.log(JSON.stringify(response))
            if ('remoteMessage' in response.notification.request.trigger) {
                url = response.notification?.request?.trigger?.remoteMessage?.data?.url as string;
            } else if ('payload' in response.notification.request.trigger) {
                url = response.notification?.request?.trigger?.payload?.url as string;
            }

            if (!url) return;
            // Let React Navigation handle the URL
            listener(url);
        });

        return () => {
            // Clean up the event listeners
            Linking.removeEventListener('url', onReceiveURL);
            subscription.remove();
        };
    },
};

export default linking;
