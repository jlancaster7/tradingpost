import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { initLds, setValue } from '../lds';
import { Authentication } from '../Authentication';
import { Api } from "@tradingpost/common/api";
import { registerDeviceForNotifications } from "../utils/notifications";

import '../SecurityList'

export default function useCachedResources() {
    const [isLoadingComplete, setLoadingComplete] = useState(false);

    // Load any resources or data that we need prior to rendering the app
    useEffect(() => {
        (async () => {
            try {

                SplashScreen.preventAutoHideAsync();
                // Load fonts
                await Font.loadAsync({
                    ...FontAwesome.font,
                    //                                     SpaceMono-Regular
                    'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
                    'K2D': require('../assets/fonts/K2D-Regular.ttf'),
                });

                const lds = await initLds();
                if (lds.authToken) {
                    try {
                        const results = await Authentication.signIn("", lds.authToken);
                        setValue("loginResult", results.loginResult);
                        setValue("currentUser", results.currentUser);
                        if (results.currentUser?.email)
                            await registerDeviceForNotifications();
                    } catch (ex) {
                        setValue("authToken", undefined);
                        console.error(ex);
                    }
                }


            } catch (e) {
                // We might want to provide this error information to an error reporting service
                console.error(e);
            } finally {
                setLoadingComplete(true);
                SplashScreen.hideAsync();
            }
        })()
    }, []);


    return {
        isLoadingComplete,
    }
}
