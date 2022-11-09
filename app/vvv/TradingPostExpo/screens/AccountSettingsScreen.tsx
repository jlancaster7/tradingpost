import React, { useEffect, useState, useRef } from "react"
import { IconifyIcon } from "../components/IconfiyIcon"
import { Section, Subsection } from "../components/Section"
import { SwitchField } from "../components/SwitchField"
import { Api } from "@tradingpost/common/api";
import { CreateAccountProps, sideMargin } from "./create_account/shared"
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
import { useAppUser } from "../Authentication"
import { RootStackScreenProps } from "../navigation/pages";


export function AccountSettingsScreen(props: RootStackScreenProps<"AccountSettings">) {
    const { loginState, signIn } = useAppUser();
    const appUser = loginState?.appUser, authToken = loginState?.authToken
    const [mentionCheck, setMentionCheck] = useState<boolean>(appUser?.settings?.push_notifications.mentions === undefined ? true : appUser?.settings?.push_notifications.mentions),
        [upvotesCheck, setUpvotesCheck] = useState<boolean>(appUser?.settings?.push_notifications.upvotes === undefined ? true : appUser?.settings?.push_notifications.upvotes),
        [watchlistChangeCheck, setWatchlistChangeCheck] = useState<boolean>(appUser?.settings?.push_notifications.watchlist_changes === undefined ? true : appUser?.settings?.push_notifications.watchlist_changes),
        [performanceCheck, setPerformanceCheck] = useState<boolean>(appUser?.settings?.portfolio_display.performance === undefined ? false : appUser?.settings?.portfolio_display.performance),
        [holdingsCheck, setHoldingsCheck] = useState<boolean>(appUser?.settings?.portfolio_display.holdings === undefined ? false : appUser?.settings?.portfolio_display.holdings),
        [tradesCheck, setTradesCheck] = useState<boolean>(appUser?.settings?.portfolio_display.trades === undefined ? false : appUser?.settings?.portfolio_display.trades),
        [analystCheck, setAnalystCheck] = useState<boolean>(appUser?.settings?.analyst === undefined ? false : appUser?.settings?.analyst),
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
    const onHoldingsCheckChanged = (isHoldingsChecked: boolean) => {
        setHoldingsCheck(isHoldingsChecked);
    }
    const onTradesCheckChanged = (isTradesChecked: boolean) => {
        setTradesCheck(isTradesChecked);
    }
    const onAnalystCheckChanged = (isAnalystChecked: boolean) => {
        setAnalystCheck(isAnalystChecked);
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
            .then((r: any) => {
                setAccounts(r);
            })
    }, [])

    return <ScrollWithButtons
        buttons={{
            left: {
                text: 'Cancel',
                onPress: async () => {
                    try {
                        //      await UpdateUserProfile({ status_setup: true });
                        //    SetDashboardLayout();
                        linkTo('/dash/feed')
                    }
                    catch (ex) {
                    }
                }
            },
            right: {
                text: 'Save',
                onPress: async () => {
                    try {
                        if (appUser?.id)
                            await Api.User.update(appUser.id, {
                                settings: {
                                    analyst: analystCheck,
                                    push_notifications: {
                                        mentions: mentionCheck,
                                        upvotes: upvotesCheck,
                                        watchlist_changes: watchlistChangeCheck,
                                    },
                                    portfolio_display: {
                                        performance: performanceCheck,
                                        holdings: holdingsCheck,
                                        trades: tradesCheck
                                    }
                                }
                            })

                        authToken ? await signIn("", authToken) : {};

                        linkTo('/dash/feed');

                    }
                    catch (ex) {
                    }
                }
            }
        }}>
        <View style={{ margin: sideMargin }}>
            <Section title="" style={{ padding: 10 }}>
                <SwitchField label='Analyst' checked={analystCheck} onChange={onAnalystCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            </Section>
            <Section title='Display' style={{ padding: 10 }}>
                <SwitchField label='Performance' checked={performanceCheck} onChange={onPerformanceCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                <SwitchField label='Portfolio' checked={holdingsCheck} onChange={onHoldingsCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                <SwitchField label='Trades' checked={tradesCheck} onChange={onTradesCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            </Section>
            <Section style={{ padding: 10 }} title="Link Brokerage Accounts" button={(props) => accounts?.length ? <EditButton
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
                <Table datasetKey={accounts?.map(a => a.id).join(",") || "none"} columns={[{ alias: "Brokerage", field: "broker_name", align: "left" }, { alias: "Account #", field: "account_number", align: "left" }]} data={accounts} noDataMessage="You have no linked accounts" />
            </Section>
            <Section title='Payment' style={{ padding: 10 }}>
                <Text>
                    Stripe
                </Text>
            </Section>
            <Section title='Notifications' style={{ padding: 10 }}>
                <Subsection title='Posts' alt={true}>
                    <SwitchField label='Mentions' checked={mentionCheck} onChange={onMentionCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                    <SwitchField label='Upvotes' checked={upvotesCheck} onChange={onUpvoteCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                </Subsection>
                <Subsection title='Watchlists' alt={true}>
                    {/*<SwitchField label='Price Movement' checked={watchlistPxCheck} onChange={onWatchlistPxCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>*/}
                    <SwitchField label='Changes' checked={watchlistChangeCheck} onChange={onWatchlistChangeCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                </Subsection>
            </Section>
            <Section title='Management' style={{ padding: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ fontSize: 14, alignSelf: 'center' }}>
                        Delete Account
                    </Text>
                    <PrimaryButton style={{ width: "40%", backgroundColor: "#D81222", borderColor: "#D81222" }} onPress={() => { }}>
                        FOREVER
                    </PrimaryButton>
                </View>
            </Section>
        </View>
    </ScrollWithButtons>
}