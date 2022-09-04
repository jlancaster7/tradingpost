import React, { Dispatch, ReactElement, ReactNode, Ref, SetStateAction, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
//import { ScrollView } from 'react-native-gesture-handler';
import { Tab, TabBar, TabView, Text } from '@ui-kitten/components';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { flex, font, fonts, sizes } from '../style';
import { IEntity,/* ToastMessageFunction,*/ useIsKeyboardVisible, useReadonlyEntity,/* useToast*/ } from '../utils/hooks'
//import { IsAuthenticated, useCurrentUser } from '../apis/Authentication';
import { AccountInfoSection } from './create_account/AccountInfoSection';
import { InvestmentInterestSection } from './create_account/InvestmentInterestSection';
import { AccountSettings } from './create_account/AccountSettingsSection';
import { YourContent } from './create_account/YourContentSection';
import { Alert, View, ViewStyle } from 'react-native';
//import { IDashboard, IDialog, PromptButton, PromptFunc, BaseScreen } from '../layouts/BaseLayout';
import { useData } from '../lds';
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { LoginResult } from '@tradingpost/common/api/entities/static/AuthApi';
import { NavigationProp } from '@react-navigation/native';
import { useToast, } from 'react-native-toast-notifications'
import { BasicInfoSection } from './create_account/BasicInfoSection';
import { EntityApiBase } from '@tradingpost/common/api/entities/static/EntityApiBase';
import { ProfileIconSection } from './create_account/ProfileIconSection';
import { PickWatchlistSection } from './create_account/PickWatchlistSection';
import { useAppUser } from '../App';
import { AnalystStartSection } from './create_account/AnalystStartSection';
import { LinkBrokerageSection } from './create_account/LinkBrokerageSection';
//import { Screen } from './BaseScreen';

export const screens = {
    'LoginInfo': AccountInfoSection,
    //'Verify': () => <View><Text>Verify Your Account</Text></View>,
    'BasicInfo': BasicInfoSection,
    'Watchlist': PickWatchlistSection,
    'AnalystStart': AnalystStartSection,
    'AnalystInterest': InvestmentInterestSection,
    'LinkBrokerage': LinkBrokerageSection,
    'AddClaims': YourContent,
    'ProfilePicture': ProfileIconSection//,
    //'Content Accounts': YourContent,
    //'Account Settings': AccountSettings
}
export type CreateAccountProps = {
    saveOnly?: boolean,
    user: IEntity<IUserGet>,
    //login?: LoginResult,
    //componentId: string,
    toastMessage: (msg: string, delay?: number | undefined) => void,//ToastMessageFunction,
    //    prompt: PromptFunc,
    setWizardIndex: Dispatch<SetStateAction<number>>,
    navigation: NavigationProp<any>
    /*
    next(skip?: number): void,
    back(): void,
    navigateByName(name: keyof typeof screens): void
    */
};
//export type AuthAccountProps = CreateAccountProps & { user: IEntity<IAuthenticatedUser> }

const paddView = [flex, { padding: sizes.rem1 }] as ViewStyle
export const sideMargin = sizes.rem1_5;

// export function ensureAuthProps(props: CreateAccountProps): props  is AuthAccountProps {
//     return IsAuthenticated(props.user.data)
// }



const screenKeys = Object.keys(screens);


function SubScreen(props: { screenIndex: number, caProps: CreateAccountProps }) {
    const { screenIndex, caProps } = props;
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
        { appUser } = useAppUser(),
        { value: loginResult } = useData("loginResult"),
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
            tags: []
        }),
        toast = useToast();

        let resolvedIndex = screenKeys.findIndex((k) => k === props?.route?.params?.params?.screen) ;

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
    return <TabView
        style={{
            backgroundColor: "white",
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
            return <Tab key={"TAB_" + i} >
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

    // return !props.asProfile ?
    //     <BaseScreen dashboardRef={dashRef} title={
    //         caProps.login ? (!caProps.login.verified ? 'Verify Account' : 'Setup Account') : 'Create Account'
    //     } scrollContentFlex >
    //         <Wizard activeIndex={wizardIndex} onActiveIndexChanged={(idx) => setWizardIndex(idx)}>
    //             {screenKeys.map((v, i) => <Wizard.Step state={getWizardState(i)} label={v} />)}
    //         </Wizard>
    //         <View style={flex}>
    //             <ScrollView nestedScrollEnabled
    //                 contentContainerStyle={!isKeyboardVisible ? flex : { flex: 0 }}>
    //                 {<SubScreen caProps={caProps} screenIndex={wizardIndex} />}
    //             </ScrollView>
    //         </View>
    //     </BaseScreen > :
    //     /** No idea why, but this is not scrollable unless there is a background color... a fun react-native bug. **/
    //     <View style={[flex, { backgroundColor: "transparent" }]}>
    //         <TabController
    //             items={screenKeys.map((v, i) => ({
    //                 label: v.split(" ").join("\r\n"),
    //                 labelStyle: {
    //                     //width: 96,
    //                     fontSize: fonts.xSmall,
    //                     lineHeight: fonts.xSmall * 1.1,
    //                     textAlign: "center"
    //                 }
    //             }))}>
    //             <TabController.TabBar spreadItems />
    //             <View style={flex}>
    //                 {screenKeys.map((v, i) =>
    //                     <TabController.TabPage index={i} key={v} lazy>
    //                         <View style={flex}>
    //                             <SubScreen caProps={caProps} screenIndex={i} />
    //                         </View>
    //                     </TabController.TabPage>
    //                 )}
    //             </View>
    //         </TabController>
    //     </View>



}

export function useChangeLock(caProps: CreateAccountProps, otherEntities?: IEntity<any>[]) {
    const output = useState(caProps.saveOnly || false)
    const setLockButtons = output[1];
    useEffect(() => {
        if (caProps.saveOnly) {
            const otherHasChanged = Boolean(otherEntities?.find((e) => e.hasChanged))
            setLockButtons(!(otherHasChanged || caProps.user.hasChanged));
        }
    }, [caProps.saveOnly, caProps.user.hasChanged, otherEntities]);

    return output
}

