import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners'


let globalUser = false;
const userEventName = "user_changed";


export const setGlobalUser = (value: boolean) => {
  globalUser = value;
  EventRegister.emit(userEventName);
}

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [user, setUser] = useState(globalUser);

  useEffect(() => {
    const listener = EventRegister.addEventListener(userEventName, () => {
      setUser(globalUser);
    });
    return () => {
      typeof listener === "string" ? EventRegister.removeEventListener(listener) : null;
    }
  }, [])

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
    user
  }
}
