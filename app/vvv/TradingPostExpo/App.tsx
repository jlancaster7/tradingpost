import {configApi} from '@tradingpost/common/api/entities/static/EntityApiBase'
import Constants, {AppOwnership} from 'expo-constants'
import {useURL} from 'expo-linking'
import {parse} from 'url'

if (!__DEV__) {
    configApi({
        apiBaseUrl: "https://api.tradingpostapp.com"
    })
} else if (__DEV__ && (AppOwnership.Expo === Constants.appOwnership || AppOwnership.Standalone === Constants.appOwnership || !Constants.appOwnership)) {

    //  console.log("BUNLDE URL IS " + Constants.manifest?.hostUri);
    // console.log("OTHER :" + console.log(JSON.stringify(Constants)));

    if (Constants.manifest?.hostUri)
        configApi({
            apiBaseUrl: `http://${Constants.manifest?.hostUri?.split(":")[0]}:8082`
        })
    else {

        //manual ip for api server... have been trying to find a way to avoid this...
        configApi({
            apiBaseUrl: `http://${Constants.expoConfig?.extra?.localIp || "localhost"}:8082`
        })
    }
} else {
    console.log("THIS IS A DIFFERENT CONDITION DEV: " + __DEV__ + " OWNER: " + Constants.appOwnership)
}


import {StatusBar} from 'expo-status-bar';
//import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Colors } from 'react-native-ui-lib';
import {Logs} from 'expo'
//Logs.enableExpoCliLogging()
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import {LogBox, Platform, Text} from 'react-native'
import WelcomeScreen from './screens/WelcomeScreen';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, Layout, Button, IconRegistry} from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import {ToastProvider} from 'react-native-toast-notifications';
import {setValue, useData} from './lds'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {NavigationProp, useLinkTo, useNavigation} from '@react-navigation/native';

import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {useAppUser} from './Authentication';
import {getSecurityList} from './SecurityList'
import {Api} from "@tradingpost/common/api/index";

// Colors.loadColors({
//   primary: '#11146F',
//   //primaryColor: '#2364AA',
//   //secondaryColor: '#81C3D7',
//   secondary: '#35A265',
//   lightBlue: "#cae9fb"
//   //textColor: '#221D23',
//   //errorColor: '#E63B2E',
//   //successColor: '#ADC76F',
//   //warnColor: '#FF963C'
// });


export default function App() {
    const {isLoadingComplete} = useCachedResources();

    const colorScheme = useColorScheme();
    const {appUser, signIn} = useAppUser();
    const {value: authToken, setValue: setAuthToken} = useData("authToken");
    console.log(Constants.expoConfig?.extra?.localIp);
    //try auth signin
    useEffect(() => {
        if (authToken) {
            signIn("", authToken);
        }
    }, [Boolean(authToken)])


    useEffect(() => {
        if (isLoadingComplete) {

            getSecurityList();
            //needed to add a delay to this request. It is not working if done prior to this
            //setTimeout(() => {
            //console.log("TRYING TO LOAD SECURITIES");

            //}, 4000)

        }
    }, [isLoadingComplete])
    const url = useURL();
    console.log(url);
    if (__DEV__ && url) {

        const urlParsed = parse(url, true);

        //com.tradingpostapp://expo-development-client/?url=http%3A%2F%2F10.0.0.94%3A8081 need to parse and set the api url the first run through
        if (urlParsed.hostname === "expo-development-client") {
            configApi({
                apiBaseUrl: "http://" + (urlParsed.query["url"] as string)?.split(":")[1] + ":8082"
            });
        } else {

        }
        // else if (urlParsed.hostname?.toString() === "m.tradingpostapp.com" && !urlToGoTo) {
        //   console.log("Sending you to");
        //   setUrlToGoTo(url);
        // }
    }

    // useEffect(() => {
    //   console.log("Link To Value " + urlToGoTo);
    //   try {
    //     if (urlToGoTo) {
    //       setTimeout(() => linkTo(urlToGoTo), 3000);
    //     }
    //   }
    //   catch (ex) {

    //     console.error(ex);
    //   }
    // }, [linkTo, urlToGoTo])

    // if (!isLoadingComplete) {
    //   return null;
    // }


    return <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <IconRegistry icons={EvaIconsPack}/>
        <ToastProvider>
            <Navigation whenReady={() => {


            }} colorScheme={colorScheme}/>
            <StatusBar/>
        </ToastProvider>
    </ApplicationProvider>
}



