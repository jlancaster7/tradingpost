import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@ui-kitten/components'
import { useEffect } from 'react';
import { TabScreenProps } from '../navigation';

export const AuthScreen = (props: TabScreenProps<{ platform: "twitter" | "youtube" | "spotify" | "finicity", code: string }>) => {
    const platform = props.route?.params?.platform;
    const code = props.route?.params?.code;
    useEffect(() => {

        if (platform === "twitter" && code) {
            AsyncStorage.setItem(`auth-${platform}-code`, code);
        }
        //redundant but I may change this
        else if (platform === "finicity") {
            AsyncStorage.setItem(`auth-${platform}-code`, "DONE!");
        }

    }, [platform, code]);
    return <Text>You have been authozied to {platform || "Missing platform"}</Text>
}