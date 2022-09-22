import React, { useEffect, useState, useRef } from "react"
import { ButtonField, PlaidButtonField } from "../components/ButtonField"
import { IconifyIcon } from "../components/IconfiyIcon"
import { Section, Subsection } from "../components/Section"
import { SwitchField } from "../components/SwitchField"
import { Api } from "@tradingpost/common/api";
import { CreateAccountProps, sideMargin, useChangeLock } from "./create_account/shared"
import StripeLogo from '@iconify/icons-logos/stripe'
import CheckerLogo from '@iconify/icons-mdi/checkerboard'
//import { SetDashboardLayout } from "../../layouts/DashboardLayout"
//import { deleteAccount, UpdateUserProfile } from "../../apis/Authenticfation"
import { /*bindSwitch,*/ useReadonlyEntity } from "../utils/hooks"
import { ScrollWithButtons } from "../components/ScrollWithButtons"
import { View, Animated } from "react-native"
import { useLinkTo } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openBrowserAsync } from 'expo-web-browser';
import { Icon, Text } from "@ui-kitten/components";
import { AddButton, EditButton } from "../components/AddButton";
import { Table } from "../components/Table";
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText } from "../style";
import { PrimaryButton } from "../components/PrimaryButton"
//import { getPlaidLink, setPlaidToken } from "../../apis/PlaidApi"

export function AccountSettingsScreen(props: any) {
    const [lockButtons, setLockButtons] = useChangeLock(props),
        [mentionCheck, setMentionCheck] = useState<boolean>(true),
        [upvotesCheck, setUpvotesCheck] = useState<boolean>(true),
        [watchlistChangeCheck, setWatchlistChangeCheck] = useState<boolean>(true),
        [performanceCheck, setPerformanceCheck] = useState<boolean>(true),
        [portfolioCheck, setPortfolioCheck] = useState<boolean>(true),
        [tradesCheck, setTradesCheck] = useState<boolean>(true),
        
        linkTo = useLinkTo<any>()
    
    const onMentionCheckChanged = (isMentionChecked: boolean) => {
        setMentionCheck(isMentionChecked);
    }
    const onUpvoteCheckChanged = (isUpvoteChecked: boolean) => {
        setUpvotesCheck(isUpvoteChecked);
    }
    const onWatchlistChangeCheckChanged = (isWatchlistChangeChecked: boolean) => {
        setWatchlistChangeCheck(isWatchlistChangeChecked);
    }
    const onPerformanceCheckChanged = (isPerformanceChecked: boolean) => {
        setPerformanceCheck(isPerformanceChecked);
    }
    const onPortfolioCheckChanged = (isPortfolioChecked: boolean) => {
        setPortfolioCheck(isPortfolioChecked);
    }
    const onTradesCheckChanged = (isTradesChecked: boolean) => {
        setTradesCheck(isTradesChecked);
    }

    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof Api.User.extensions.getBrokerageAccounts>>>()
    const intervalRef = useRef<any>();
    const [needsRefresh, setNeedsRefresh] = useState<{}>();
    const openLink = async () => {
        const browserName = "finicity_auth";
        await openBrowserAsync(brokerLink, { "windowName": browserName });
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
            console.log("WTF");
            if (await AsyncStorage.getItem("auth-finicity-code")) {
                console.log("CODE HAS BEEN FOUND");
                setAccounts(await Api.User.extensions.getBrokerageAccounts())
            }
        }, 5000)
    }
    //cleanup
    useEffect(() => {
        AsyncStorage.removeItem("auth-finicity-code");
        return () => {
            clearInterval(intervalRef.current);
            AsyncStorage.removeItem("auth-finicity-code");
        }
    }, [])


    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 2000,
                useNativeDriver: true
            }).start();
    }, [])
    const [brokerLink, setLink] = useState("");
    useEffect(() => {
        Api.User.extensions.generateBrokerageLink(undefined).then(({ link }) => {
            setLink(link)
        })
    }, [needsRefresh])

    useEffect(() => {
        Api.User.extensions.getBrokerageAccounts()
            .then((r) => {
                setAccounts(r);
            })
        Api.User.update(props.user.data.id, {settings: {}})
    }, [])

    return <ScrollWithButtons buttons={{
        locked: lockButtons,
        left: props.saveOnly ? undefined : {
            text: 'Cancel',
            onPress: async () => {
                setLockButtons(true);
                try {
                    //      await UpdateUserProfile({ status_setup: true });
                    //    SetDashboardLayout();
                linkTo('/dash/feed')
                }
                catch (ex) {
                    setLockButtons(false);
                }
            }
        },
        right: {
            text: 'Save',
            onPress: async () => {
                setLockButtons(true);
                try {
                    // await UpdateUserProfile({
                    //     status_setup: true,
                    //     settings: {
                    //         notifications: notificationEntity.data,
                    //         broadcasting: broadcastEntity.data
                    //     }
                    // });
                    
                    // if (!props.saveOnly)
                    //     SetDashboardLayout();
                    linkTo('/dash/feed')

                }
                catch (ex) {
                    setLockButtons(false);
                }
            }
        }
    }}>
        <View style={{ margin: sideMargin }}>
            <Section title='Notifications' style={{padding: 10}}>
                <Subsection title='Posts'>
                    <SwitchField label='Mentions' checked={mentionCheck} onChange={onMentionCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>
                    <SwitchField label='Upvotes'checked={upvotesCheck} onChange={onUpvoteCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}}  toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}} />
                </Subsection>
                <Subsection title='Watchlists'>
                    {/*<SwitchField label='Price Movement' checked={watchlistPxCheck} onChange={onWatchlistPxCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>*/}
                    <SwitchField label='Changes' checked={watchlistChangeCheck} onChange={onWatchlistChangeCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}}  toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}} />
                </Subsection>


            </Section>

            <Section style={{padding: 10}} title="Link Brokerage Accounts" button={(props) => accounts?.length ? <EditButton
                onPress={() => {
                    openLink();
                }}
                height={35}
                width={35}
            /> : <AddButton
                onPress={() => openLink()}
                height={35}
                width={35}
            />} >
                <Table datasetKey={accounts?.map(a => a.id).join(",") || "none"} columns={[{ alias:"Brokerage", field: "broker_name", align: "left" }, { alias: "Account #", field: "account_number", align: "left" }]} data={accounts} noDataMessage="You have no linked accounts" />
            </Section>
            <Section title='Payment' style={{padding: 10}}>
                <Text>
                    Stripe
                </Text>
            </Section>
            
            <Section title='Display' style={{padding: 10}}>
                <SwitchField label='Performance' checked={performanceCheck} onChange={onPerformanceCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>
                <SwitchField label='Portfolio' checked={portfolioCheck} onChange={onPortfolioCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>
                <SwitchField label='Trades' checked={tradesCheck} onChange={onTradesCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>
            </Section>
            <Section title='Management' style={{padding: 10}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5}}>
                    <Text style={{fontSize: 14, alignSelf: 'center'}}>
                        Delete Account
                    </Text>
                    <PrimaryButton style={{ width:  "40%", backgroundColor: "#D81222", borderColor: "#D81222" }} onPress={() => {}}> 
                        FOREVER
                    </PrimaryButton>
                </View>
            </Section>
            
        </View>
    </ScrollWithButtons>
}