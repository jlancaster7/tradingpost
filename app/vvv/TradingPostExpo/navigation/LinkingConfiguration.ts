/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { getActionFromState, getStateFromPath, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { NavIconKeys, navIcons } from '../images';
import { screens } from '../screens/CreateAccountScreen';

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
        const action = getActionFromState(state, options);
        return action;
    }
};

export default linking;
