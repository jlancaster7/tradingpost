import { configApi } from '@tradingpost/common/api/entities/static/EntityApiBase'
import Constants, { AppOwnership } from 'expo-constants'

if (!__DEV__) {
  configApi({
    apiBaseUrl: "https://api.tradingpostapp.com"
  })
}
else if (__DEV__ && AppOwnership.Expo === Constants.appOwnership) {
  console.log("BUNLDE URL IS " + Constants.manifest?.hostUri);
  configApi({

    apiBaseUrl: `http://${Constants.manifest?.hostUri?.split(":")[0]}:8082`
  })

}

import { StatusBar } from 'expo-status-bar';
//import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Colors } from 'react-native-ui-lib';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation, { AllPages } from './navigation';
import { LogBox, Platform, Text } from 'react-native'
import WelcomeScreen from './screens/WelcomeScreen';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Button, IconRegistry } from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import { ToastProvider } from 'react-native-toast-notifications';
import { useData } from './lds'
import React, { useCallback, useEffect } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useAppUser } from './Authentication';
import { getSecurityList } from './SecurityList'
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




LogBox.ignoreAllLogs();



export default function App() {
  const { isLoadingComplete } = useCachedResources();

  const colorScheme = useColorScheme();
  const { appUser, signIn } = useAppUser();
  const { value: authToken, setValue: setAuthToken } = useData("authToken");


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

  if (!isLoadingComplete) {
    return null;
  }


  return <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
    <IconRegistry icons={EvaIconsPack} />
    <ToastProvider>
      <Navigation colorScheme={colorScheme} />
      <StatusBar />
    </ToastProvider>
  </ApplicationProvider>
}



