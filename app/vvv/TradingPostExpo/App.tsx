import { configApi } from '@tradingpost/common/api/entities/static/EntityApiBase'
import Constants, { AppOwnership } from 'expo-constants'
import { useURL } from 'expo-linking'
import { parse } from 'url'

if (!__DEV__) {
  configApi({
    apiBaseUrl: "https://api.tradingpostapp.com"
  })
} else if (__DEV__ && (AppOwnership.Expo === Constants.appOwnership || AppOwnership.Standalone === Constants.appOwnership || !Constants.appOwnership)) {

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
}
if (__DEV__ && Platform.OS === "web")
  configApi({
    callbackUrl: "http://localhost:19006"
  })




import { StatusBar } from 'expo-status-bar';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Button, IconRegistry } from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import { ToastProvider } from 'react-native-toast-notifications';
import React, { useEffect, } from 'react';


import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { getSecurityList } from './SecurityList'
import { Platform } from 'react-native'

export default function App() {
  const { isLoadingComplete } = useCachedResources();
  const colorScheme = useColorScheme();

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
        apiBaseUrl: "http://" + (urlParsed.query["url"] as string)?.split(":")[1] + ":8082"
      });
    }

  }

  return !isLoadingComplete ? null : <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
    <IconRegistry icons={EvaIconsPack} />
    <ToastProvider>
      <Navigation colorScheme={colorScheme} />
      <StatusBar />
    </ToastProvider>
  </ApplicationProvider>
}



