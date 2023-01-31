import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {Text} from '@ui-kitten/components'
import {useEffect} from 'react';
import {View} from 'react-native';
import {RootStackScreenProps} from '../navigation/pages';

export const AuthScreen = (props: RootStackScreenProps<"Auth">) => {
    const nav = useNavigation()
    const platform = props.route?.params?.platform;
    const code = props.route?.params?.code;
    console.log("############################## LOADED THE AUTH SCREEN ########################################");
    useEffect(() => {
        console.log("SETTING THE PLATFORM CODE");
        if (platform === "twitter" && code) {
            AsyncStorage.setItem(`auth-${platform}-code`, code);
        } else if (platform === "youtube" && code) {
            AsyncStorage.setItem(`auth-${platform}-code`, code);
        }
        //redundant but I may change this
        else if (platform === "finicity") {
            console.log(props.route.params);
            AsyncStorage.setItem(`auth-${platform}-code`, "DONE!");
        }
        if (nav.canGoBack())
            nav.goBack()

    }, [platform, code]);
    return (
        <View>
            <Text>You have been authorized to {platform || "Missing platform"}</Text>
        </View>
    )
}