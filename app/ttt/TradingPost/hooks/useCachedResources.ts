import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { initLds, setValue } from '../lds';
import Auth from '@tradingpost/common/api/entities/static/AuthApi'
import { Authentication, useAppUser } from '../App';
import '../utils/hooks';
export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {


        SplashScreen.preventAutoHideAsync();



        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });

        const lds = await initLds();
        console.log("Caching Stuff" + JSON.stringify(lds));
       // useSecuritiesList();
        if (lds.authToken) {
          console.log("There is an LDS token");
          try {
            const results = await Authentication.signIn("", lds.authToken);
            setValue("loginResult", results.loginResult);
            setValue("currentUser", results.currentUser);
          }
          catch (ex) {
            setValue("authToken", undefined);
            console.error(ex);
          }
        }





      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return {
    isLoadingComplete,
  }
}
