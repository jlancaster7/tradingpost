import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@ui-kitten/components'
import { useEffect } from 'react';
import { TabScreenProps } from '../navigation';
import { RootStackScreenProps } from '../navigation/pages';

export const AuthScreen = (props: RootStackScreenProps<"Auth">) => {
    const platform = props.route?.params?.platform;
    const code = props.route?.params?.code;

    useEffect(() => {

        if (platform === "twitter" && code) {
            AsyncStorage.setItem(`auth-${platform}-code`, code);
        }
        else if (platform === "youtube" && code) {
            AsyncStorage.setItem(`auth-${platform}-code`, code);
        }
        //redundant but I may change this
        else if (platform === "finicity") {
            AsyncStorage.setItem(`auth-${platform}-code`, "DONE!");
        }
        if (props.navigation.canGoBack())
            props.navigation.goBack();

    }, [platform, code]);
    return <Text>You have been authozied to {platform || "Missing platform"}</Text>
}