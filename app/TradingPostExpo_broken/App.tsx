import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Colors } from 'react-native-ui-lib';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation, { PublicPages } from './navigation';
import { Text } from 'react-native'
import WelcomeScreen from './screens/WelcomeScreen';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Button } from '@ui-kitten/components';
import theme from "./theme-light.json"; // <-- Import app theme
import { ToastProvider } from 'react-native-toast-notifications';
import { useData } from './lds'
import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import User from '@tradingpost/common/api/entities/apis/UserApi';
import { useCallback } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { configApi } from '@tradingpost/common/api/entities/static/EntityApiBase'
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

configApi({
  apiBaseUrl: process.env.API_BASE_URL
})

export default function App() {
  const { isLoadingComplete } = useCachedResources();
  const { appUser } = useAppUser();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  }

  return <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
    <ToastProvider>
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} isLoggedIn={Boolean(appUser)} />
        <StatusBar />
      </SafeAreaProvider>
    </ToastProvider>
  </ApplicationProvider>
}


export const useAppUser = () => {
  const { value: appUser, setValue: setAppUser } = useData("currentUser");
  const { value: loginResult, setValue: setLoginResult } = useData("loginResult");

  return {
    appUser,
    signIn: useCallback((navigation: NavigationProp<any>, email: string, pass: string) => {
      return (async () => {
        const result = await Auth.login(email, pass);
        setLoginResult(result);
        if (result.user_id) {
          setAppUser(await User.get(result.user_id));
        }
        else
          navigation.navigate("Create")
      })()
    }, []),
    signOut: useCallback(() => {
      Auth.signOut();
      setAppUser(undefined);
    }, [])
  }
}

