import {configApi} from '@tradingpost/common/api/entities/static/EntityApiBase'
import Constants, {AppOwnership} from 'expo-constants'
import {useURL} from 'expo-linking'
import {parse} from 'url'

const hackyGetLocalIp = (logUrl?: string): string => {
    if (!logUrl) throw new Error("could not find log url for ios device");
    const [protocol, url, portWithPath] = logUrl.split(":");
    const newUrl = `http:${url}:8080`;
    console.log("NEW URL: ", newUrl)
    return newUrl;
}

if (!__DEV__) {
    configApi({
        apiBaseUrl: "https://api.tradingpostapp.com"
    })
} else if (__DEV__ && (AppOwnership.Expo === Constants.appOwnership || AppOwnership.Standalone === Constants.appOwnership || !Constants.appOwnership)) {
    if (Constants.platform?.ios) {
        const u = hackyGetLocalIp(Constants.manifest?.logUrl);
        console.log("HERE WITH URL: ", u);
        configApi({
            apiBaseUrl: u
        })
    } else if (Constants.manifest?.hostUri) {
        configApi({
            apiBaseUrl: `http://${Constants.manifest?.hostUri?.split(":")[0]}:8080`
        })
    } else {
        console.log("HERE....")
        //manual ip for api server... have been trying to find a way to avoid this...
        configApi({
            apiBaseUrl: `http://${Constants.expoConfig?.extra?.localIp || "localhost"}:8080`
        })
    }
}

if (__DEV__ && Platform.OS === "web")
    configApi({
        callbackUrl: "http://localhost:19006"
    })


import {StatusBar} from 'expo-status-bar';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, Layout, Button, IconRegistry} from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import {ToastProvider} from 'react-native-toast-notifications';
import React, {useEffect,} from 'react';


import {EvaIconsPack} from '@ui-kitten/eva-icons';

import {getSecurityList} from './SecurityList'
import {Platform} from 'react-native'
import * as constants from "constants";

export default function App() {
    console.log("Started")
    const {isLoadingComplete} = useCachedResources();
    //const colorScheme = useColorScheme();
    const colorScheme = 'light';
    useEffect(() => {
        if (isLoadingComplete) {
            getSecurityList();
        }
    }, [isLoadingComplete])
    const url = useURL();
    if (__DEV__ && url) {

        const urlParsed = parse(url, true);

        //com.tradingpostapp://expo-development-client/?url=http%3A%2F%2F10.0.0.94%3A8081 need to parse and set the api url the first run through
        if (urlParsed.hostname === "expo-development-client") {
            configApi({
                apiBaseUrl: "http://" + (urlParsed.query["url"] as string)?.split(":")[1] + ":8080"
            });
        }

    }

    return !isLoadingComplete ? null : <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <IconRegistry icons={EvaIconsPack}/>
        <ToastProvider>
            <Navigation colorScheme={colorScheme}/>
            <StatusBar/>
        </ToastProvider>
    </ApplicationProvider>
}



