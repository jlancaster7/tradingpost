/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { getActionFromState, getStateFromPath, LinkingOptions, StackActions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { NavIconKeys, navIcons } from '../images';
import { screens } from '../screens/CreateAccountScreen';
import * as Notifications from 'expo-notifications';
import { Log } from '../utils/logger';
import { useAppUser } from '../Authentication';
import { getValueWNoUpdates } from '../lds';

const ConfigOverride: Partial<Record<NavIconKeys, any>> = {
    Notification: {
        path: "dash/notification",
    }
};


let linkLoaded = false
let isDashLoaded = true;
export const setDashLoaded = () => {
    linkLoaded = false;
}
const needsDash = () => {
    return !isDashLoaded && linkLoaded
}

const linking: LinkingOptions<any> = {
    prefixes: [Linking.createURL('/'), "https://m.tradingpostapp.com"],
    config: {
        initialRouteName:"Dash",
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
            Profile: {
                path: "profile",
            //    initialRouteName: "Dash" as any
            },
            PostScreen: {
                path: "post",
          //      initialRouteName: "Dash" as any
            },
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
        console.log("Getting state from path");
        const state = getStateFromPath(path, options);
        // Replaces the current screen if $replace is in the parameter
        // ...not sure if this will work properly in all navigation situations
        // maybe need to make this only work if the navigator is a dash? or look for the last dash navigator

        console.log(state);

        if (state && (state.routes?.[state.routes.length - 1]?.params as any)?.$replace && state.routes.length > 1) {
            console.log("Running a replace ....");
            delete (state.routes?.[state.routes.length - 1]?.params as any).$replace;
            state.routes.splice(state.routes.length - 2, 1);
        }
        // if (getValueWNoUpdates("currentUser") && state?.routes.length === 1) {
        //    // console.log("TRYING TO GET A FUCKING NEW STATE WITH POATH FQEHEWOFNWROFWEFRWOG");
        //     //const baseState = getStateFromPath("/dash/feed");
        
        //     //console.log(baseState)
        //     //if (baseState)
        //       //  state.routes.unshift(...baseState.routes)
        //       state.routes.unshift({
        //         name:"Dash"
        //       })
        // }

        console.log("DONE state from path");
        console.log(state);
        return state;

    },
    getActionFromState: (state, options) => {
        console.log("Action from state is here :::::::::::::::::::::::")
        return getActionFromState(state, options);
    },

    async getInitialURL() {
        console.log("IM TRYING TO GET INIT URL");

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

        const outputUrl = await Linking.getInitialURL();;

        return outputUrl
    },
    subscribe(listener) {
        const onReceiveURL = ({ url }: { url: string }) => {
            console.log("URL IS :::::::::::::::::::::::" + url)
            listener(url)
        };
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
