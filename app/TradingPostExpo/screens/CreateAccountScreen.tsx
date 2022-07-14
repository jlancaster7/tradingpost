import React, { Dispatch, ReactElement, ReactNode, Ref, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
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
import { WatchlistSection } from '../components/WatchlistSection';
//import { Screen } from './BaseScreen';

export type CreateAccountProps = {
    saveOnly?: boolean,
    user: IEntity<IUserGet>,
    login?: LoginResult,
    //componentId: string,
    toastMessage: (msg: string, delay?: number | undefined) => void,//ToastMessageFunction,
    //    prompt: PromptFunc,
    setWizardIndex: Dispatch<SetStateAction<number>>,
    navigation: NavigationProp<any>
    next(): void,
    back(): void
};
//export type AuthAccountProps = CreateAccountProps & { user: IEntity<IAuthenticatedUser> }

const paddView = [flex, { padding: sizes.rem1 }] as ViewStyle
export const sideMargin = sizes.rem1_5;

// export function ensureAuthProps(props: CreateAccountProps): props is AuthAccountProps {
//     return IsAuthenticated(props.user.data)
// }

const screens = {
    'Login Info': AccountInfoSection,
    'Verify': () => <View><Text>Verify Your Account</Text></View>,
    'Basic Info': BasicInfoSection,
    'Watchlist': WatchlistSection,
    'Profile Picture': ProfileIconSection,
    'Investment Interests': InvestmentInterestSection,
    'Content Accounts': YourContent,
    'Account Settings': AccountSettings
}

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

    console.log("TOKEN IS::::" + EntityApiBase.token);
    const
        //  { isKeyboardVisible } = useIsKeyboardVisible(),
        { value: currentUser } = useData("currentUser"),
        { value: loginResult } = useData("loginResult"),
        resolveIdx = useCallback(() => EntityApiBase.token ? 2 : 0, []),
        { verified } = loginResult || {},
        [wizardIndex, setWizardIndex] = useState(resolveIdx),
        user = useReadonlyEntity<IUserGet>(currentUser || {
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
        toast = useToast()
        ;


    //dashRef = useRef<IDashboard>()

    const { resetData } = user;
    useEffect(() => {
        if (loginResult) {
            console.log("YEST Login Result");
            if (wizardIndex === 0 || wizardIndex === 1) {
                setWizardIndex(resolveIdx())
            }
        }
        else {
            console.log("No Login Result");
        }
    }, [loginResult, wizardIndex, EntityApiBase.token])

    // function getWizardState(idx: number) {
    //     return idx <= wizardIndex ? Wizard.States.ENABLED : Wizard.States.DISABLED
    // }

    const caProps = {
        user,
        navigation: props.navigation,
        toastMessage: ((msg: string, delay: number | undefined) => {

            toast.show(msg, {
                duration: delay,
                placement: "top"
            });
            //Alert.alert("Toast...", msg);
            //dashRef.current?.toastMessage(msg, delay)
        }),
        login: loginResult,
        // prompt: (title: string, message: string, buttons: PromptButton[]) => {
        //     return dashRef.current?.prompt(title, message, buttons) as Ref<IDialog>;
        // },
        setWizardIndex,
        saveOnly: false, //props.asProfile,
        next: () => {
            setWizardIndex(wizardIndex + 1);
        },
        back: () => {
            setWizardIndex(Math.max(wizardIndex - 1, 1));
        },
        // componentId
    }

    return <TabView
        style={{
            backgroundColor: "white"
        }}
        swipeEnabled={false}
        selectedIndex={wizardIndex}
        indicatorStyle={{
            height: 0
        }}
        tabBarStyle={{
            height: 0,
            padding: 0
        }}
        onSelect={index => setWizardIndex(index)}>

        {screenKeys.map((v, i) => {
            const Screen = screens[screenKeys[i] as keyof typeof screens];
            return <Tab >
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

