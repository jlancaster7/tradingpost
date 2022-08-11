import { StatusBar } from 'expo-status-bar';
//import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Colors } from 'react-native-ui-lib';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation, { AllPages } from './navigation';
import { Platform, Text } from 'react-native'
import WelcomeScreen from './screens/WelcomeScreen';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Button, IconRegistry } from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import { ToastProvider } from 'react-native-toast-notifications';
import { useData } from './lds'
import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import User from '@tradingpost/common/api/entities/apis/UserApi';
import { } from '@tradingpost/common/api/entities/apis/UserApi';
import React, { useCallback, useEffect } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { configApi } from '@tradingpost/common/api/entities/static/EntityApiBase'
import { EvaIconsPack } from '@ui-kitten/eva-icons';

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

//console.log("MY URL IS DEFINED HERE " + process.env.API_BASE_URL);


// if (Platform.OS === "web")
//   configApi({
//     apiBaseUrl: "//api.tradingpostapp.com"
//   })

//console.log("API ENV::::::::::::::::::" + process.env.API_BASE_URL)

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

export const Authentication = {

  signIn: async (email: string, pass: string) => {
    const result = await Auth.login(email, pass);
    return {
      loginResult: result,
      currentUser: result.user_id ? await User.get(result.user_id) : undefined
    }
  }
}

export const useAppUser = () => {
  const { value: appUser, setValue: setAppUser } = useData("currentUser");
  const { value: loginResult, setValue: setLoginResult } = useData("loginResult");
  const { value: authToken, setValue: setAuthToken } = useData("authToken");

  return {
    appUser,
    authToken,
    loginResult,
    signIn: useCallback(async (email: string, pass: string) => {
      const value = await Authentication.signIn(email, pass)
      setLoginResult(value.loginResult);
      setAppUser(value.currentUser);

      if (value.loginResult.user_id)
        setAuthToken(value.loginResult.token);

    }, []),
    signOut: useCallback(() => {
      Auth.signOut();
      setAuthToken(undefined);
      setLoginResult(undefined);
      setAppUser(undefined);
    }, [])
  }
}

