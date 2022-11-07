import React, { useLayoutEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tab, TabView } from '@ui-kitten/components';
import { useReadonlyEntity } from '../utils/hooks'
import { AccountInfoSection } from './create_account/AccountInfoSection';
import { InvestmentInterestSection } from './create_account/InvestmentInterestSection';
import { YourContent } from './create_account/YourContentSection';
import { useData } from '../lds';
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { useToast, } from 'react-native-toast-notifications'
import { BasicInfoSection } from './create_account/BasicInfoSection';
import { ProfileIconSection } from './create_account/ProfileIconSection';
import { PickWatchlistSection } from './create_account/PickWatchlistSection';
import { useAppUser } from '../Authentication';
import { AnalystStartSection } from './create_account/AnalystStartSection';
import { LinkBrokerageSection } from './create_account/LinkBrokerageSection';
import { AppColors } from '../constants/Colors';
import { SubscriptionCostSection } from './create_account/SubscrpitionCostSection';
import { Log } from '../utils/logger';

export const screens = {
    'LoginInfo': AccountInfoSection,
    'BasicInfo': BasicInfoSection,
    'Watchlist': PickWatchlistSection,
    'AnalystStart': AnalystStartSection,
    'AnalystInterest': InvestmentInterestSection,
    'LinkBrokerage': LinkBrokerageSection,
    'AddClaims': YourContent,
    'SubscriptionCost': SubscriptionCostSection,
    'ProfilePicture': ProfileIconSection
}


const screenKeys = Object.keys(screens);



export default (props: any) => {
    /**
     * State & hooks
     */
    const { loginState } = useAppUser(),
        appUser = loginState?.appUser, userState = loginState?.setupStatus,
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
        }),
        toast = useToast()

    /** Updates user data is the current user changes **/
    useLayoutEffect(() => {
        if (appUser)
            user.resetData(appUser);
    }, [appUser]);

    /**
     * Sub Screen resolution based on parameters 
     */
    let subScreen: keyof typeof screens = (props?.route?.params?.params?.screen) || "LoginInfo";
    if (userState?.needsSettings)
        subScreen = "AnalystStart"
    else if (userState?.needsAnalystSettings)
        subScreen = "AnalystInterest"
    let resolvedIndex = screenKeys.findIndex((k) => k === subScreen);
    if (resolvedIndex < 0) {
        resolvedIndex = 0;
        Log.error(new Error(`Invalid create subscreen key :'${subScreen}'. Defaulting to index 0`));
    }


    const caProps = {
        user,
        toastMessage: (msg: string, delay: number | undefined) => {
            toast.show(msg, {
                duration: delay,
                placement: "top"
            });
        }
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
        selectedIndex={screenKeys.findIndex((k) => k === props?.route?.params?.params?.screen)}
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
    >
        {screenKeys.map((v, i) => {
            const Screen = screens[screenKeys[i] as keyof typeof screens];
            return <Tab key={"TAB_" + i}>
                <Screen {...caProps} />
            </Tab>
        })}
    </TabView>


}

