import React, {
    Dispatch,
    ReactElement,
    ReactNode,
    Ref,
    SetStateAction,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from 'react';
import {SafeAreaProvider, SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
//import { ScrollView } from 'react-native-gesture-handler';
import {Tab, TabBar, TabView, Text} from '@ui-kitten/components';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {flex, font, fonts, sizes} from '../style';
import {IEntity,/* ToastMessageFunction,*/ useIsKeyboardVisible, useReadonlyEntity,/* useToast*/} from '../utils/hooks'
//import { IsAuthenticated, useCurrentUser } from '../apis/Authentication';
import {AccountInfoSection} from './create_account/AccountInfoSection';
import {InvestmentInterestSection} from './create_account/InvestmentInterestSection';

import {YourContent} from './create_account/YourContentSection';
import {Alert, View, ViewStyle} from 'react-native';
//import { IDashboard, IDialog, PromptButton, PromptFunc, BaseScreen } from '../layouts/BaseLayout';
import {useData} from '../lds';
import {IUserGet} from "@tradingpost/common/api/entities/interfaces";
import {LoginResult} from '@tradingpost/common/api/entities/static/AuthApi';
import {NavigationProp} from '@react-navigation/native';
import {useToast,} from 'react-native-toast-notifications'
import {BasicInfoSection} from './create_account/BasicInfoSection';
import {EntityApiBase} from '@tradingpost/common/api/entities/static/EntityApiBase';
import {ProfileIconSection} from './create_account/ProfileIconSection';
import {PickWatchlistSection} from './create_account/PickWatchlistSection';
import {useAppUser} from '../Authentication';
import {AnalystStartSection} from './create_account/AnalystStartSection';
import {LinkBrokerageSection} from './create_account/LinkBrokerageSection';
import {AppColors} from '../constants/Colors';
import {CreateAccountProps} from './create_account/shared';
import {SubscriptionCostSection} from './create_account/SubscrpitionCostSection';
//import { Screen } from './BaseScreen';

export const screens = {
    'LoginInfo': AccountInfoSection,
    //'Verify': () => <View><Text>Verify Your Account</Text></View>,
    'BasicInfo': BasicInfoSection,
    //'AccountSettings': AccountSettings,
    'Watchlist': PickWatchlistSection,
    'AnalystStart': AnalystStartSection,
    'AnalystInterest': InvestmentInterestSection,
    'LinkBrokerage': LinkBrokerageSection,
    'AddClaims': YourContent,
    'SubscriptionCost': SubscriptionCostSection,
    'ProfilePicture': ProfileIconSection//,
    //'Content Accounts': YourContent,

}


// export function ensureAuthProps(props: CreateAccountProps): props  is AuthAccountProps {
//     return IsAuthenticated(props.user.data)
// }


const screenKeys = Object.keys(screens);

function SubScreen(props: { screenIndex: number, caProps: CreateAccountProps }) {
    const {screenIndex, caProps} = props;
    const Screen = screens[screenKeys[screenIndex] as keyof typeof screens];
    /*Hacky based on assumptions*/
    return (screenIndex === 0) ?
        <Screen {...(caProps as any)} /> :
        <Text>Something went very wrong...</Text>
}

// function isVerified(authedUser: IAuthenticatedUser | undefined) {
//     return authedUser?.firstName && authedUser?.lastName && authedUser?.status_confirmed;
// }


export default (props: any) => {
    const
        //  { isKeyboardVisible } = useIsKeyboardVisible(),
        {appUser} = useAppUser(),
        {value: loginResult} = useData("loginResult"),
        // resolveIdx = useCallback(() => {
        //     return EntityApiBase.token ? 2 : 0
        // }
        // , []),
        //{ verified } = loginResult || {},
        [wizardIndex, setWizardIndex] = useState(0),
        user = useReadonlyEntity<IUserGet>(appUser || {
            profile_url: "",
            first_name: "",
            last_name: "",
            handle: "",
            email: "",
            bio: "",
            claims: [],
            display_name: "",
            id: "",
            tags: [],
            subscription: null as any,
            is_subscribed: false
        }),
        toast = useToast();

    let resolvedIndex = screenKeys.findIndex((k) => k === props?.route?.params?.params?.screen);

    resolvedIndex = resolvedIndex === -1 ? 2 : resolvedIndex;
    /*
    let resolvedIndex = 0;
    if (wizardIndex < 2 && loginResult) {
        resolvedIndex = 1
        if (appUser)
            resolvedIndex = 2
        //resolvedIndex = 7
    }
    resolvedIndex = Math.max(wizardIndex, resolvedIndex);
    */
    useLayoutEffect(() => {
        if (appUser)
            user.resetData(appUser);
    }, [appUser]);
    const caProps = {
        user,
        navigation: props.navigation,
        toastMessage: ((msg: string, delay: number | undefined) => {
            toast.show(msg, {
                duration: delay,
                placement: "top"
            });
        }),
        setWizardIndex,
        saveOnly: false,
        /*
        next: (length: number = 1) => {
            setWizardIndex(resolvedIndex + length);
        },
        navigateByName: (name: keyof typeof screens) => {
            const index = screenKeys.findIndex((k) => k === name);
            console.log("FOUND INDEX OF ::::" + index);
            setWizardIndex(index);
        },
        back: () => {
            setWizardIndex(Math.max(resolvedIndex - 1, 1));
        }
        */
    }

    const insets = useSafeAreaInsets();

    return <TabView
        style={{
            paddingTop: insets.top / 2,
            backgroundColor: AppColors.background,
            flexGrow: 1,
            maxHeight: "100%",
        }}
        swipeEnabled={false}
        selectedIndex={resolvedIndex}
        indicatorStyle={{
            height: 0
        }}
        tabBarStyle={{
            height: 0,
            padding: 0,
            paddingBottom: 0,
            paddingTop: 0
        }}
        shouldLoadComponent={(index) => index === resolvedIndex}
        // onSelect={index => {
        //     setWizardIndex(index);
        // }}
    >
        {screenKeys.map((v, i) => {
            const Screen = screens[screenKeys[i] as keyof typeof screens];
            return <Tab key={"TAB_" + i}>
                <Screen {...caProps} />
            </Tab>
        })}
        {/* <Tab title='USERS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>USERS</Text>
            </Layout>
        </Tab>
        <Tab title='ORDERS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>ORDERS</Text>
            </Layout>
        </Tab>
        <Tab title='TRANSACTIONS'>
            <Layout style={styles.tabContainer}>
                <Text category='h5'>TRANSACTIONS</Text>
            </Layout>
        </Tab> */}
    </TabView>


}

