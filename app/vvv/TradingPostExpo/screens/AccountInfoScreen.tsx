import React, { useState, useMemo } from "react"
import { ElevatedSection, Section, Subsection } from "../components/Section"
import { SwitchField } from "../components/SwitchField"
import { Api } from "@tradingpost/common/api";
import { sideMargin } from "./create_account/shared"
import { ScrollWithButtons } from "../components/ScrollWithButtons"
import { View, Pressable } from "react-native"
import { useLinkTo, useNavigation } from "@react-navigation/native"
import { useSecuritiesList } from '../SecurityList'
import { Autocomplete, AutocompleteItem, Icon, IndexPath, Text, TabView, Tab } from "@ui-kitten/components";
import { AddButton, EditButton } from "../components/AddButton";
import { flex, sizes, fonts } from "../style";
import { PrimaryButton } from "../components/PrimaryButton"
import { useAppUser } from "../Authentication"
import { investmentStrats, questionStyle, gicsAC } from './create_account/InvestmentInterestSection'
import { KeyboardAvoidingInput } from "../components/KeyboardAvoidingInput";
import { Picker } from "../components/Picker";
import { ProfileButton } from "../components/ProfileButton";
import { Slider } from "../components/Slider";
import { AppColors } from "../constants/Colors";
import { YourContentComponent } from "../components/YourContentComponent";
import { IUserUpdate } from "@tradingpost/common/api/entities/interfaces";
import { Log } from "../utils/logger";
import { LinkBrokerageComponent } from "../components/LinkBrokerageComponent";

export function AccountInfoScreen() {
    const { loginState, signIn } = useAppUser(),
        [index, setIndex] = useState(0),
        linkTo = useLinkTo<any>()

    const definedOrValue = (test: boolean | undefined, d: boolean) => {
        return test === undefined ? d : test
    }
    const appUser = loginState?.appUser;
    const [accountUpdates, setAccountUpdates] = useState<IUserUpdate>({
        bio: appUser?.bio,
        analyst_profile: appUser?.analyst_profile || {
            investment_strategy: "",
            portfolio_concentration: 50,
            benchmark: "",
            interests: []
        },
        profile_url: appUser?.profile_url,
        settings: {
            analyst: appUser?.settings?.analyst || false,
            portfolio_display: {
                holdings: definedOrValue(appUser?.settings?.portfolio_display.holdings, false),
                performance: definedOrValue(appUser?.settings?.portfolio_display.performance, false),
                trades: definedOrValue(appUser?.settings?.portfolio_display.trades, false)
            },
            push_notifications: {
                mentions: definedOrValue(appUser?.settings?.push_notifications.mentions, true),
                upvotes: definedOrValue(appUser?.settings?.push_notifications.upvotes, true),
                watchlist_changes: definedOrValue(appUser?.settings?.push_notifications.watchlist_changes, true)
            }
        }

    })

    return (
        <ScrollWithButtons
            buttons={{
                left: {
                    text: 'Cancel',
                    onPress: async () => {
                        try {
                            linkTo('/dash/feed')
                        }
                        catch (ex) {
                        }
                    }
                },
                right: {
                    text: 'Save',
                    onPress: async () => {
                        await Log.tryCatch(async () => {
                            if (appUser?.id && loginState?.authToken) {
                                await Api.User.update(appUser?.id || '', accountUpdates);
                                await signIn("", loginState?.authToken);
                            }
                        })

                        try {
                            linkTo('/dash/feed')
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                }
            }}>
            <View style={[flex, { margin: sideMargin, marginTop: 12 }]} >
                <TabView indicatorStyle={{ marginTop: 26 }}
                    style={{ marginVertical: sizes.rem0_5 }}
                    tabBarStyle={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}
                    selectedIndex={index}
                    onSelect={(idx) => {
                        console.log("Setting index " + idx);
                        setIndex(idx);
                    }}>
                    <Tab key={"A"} title={'Account Info'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }} >
                        <AccountInfoContent setUpdates={setAccountUpdates} updates={accountUpdates} />
                    </Tab>
                    <Tab key={"B"} title={'Your Content'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
                        <YourContentComponent />
                    </Tab>
                    <Tab key={"C"} title={'Advanced'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
                        <AdvancedTabContent setUpdates={setAccountUpdates} updates={accountUpdates} />

                    </Tab>
                </TabView>

            </View>
        </ScrollWithButtons>
    )
}
const AccountInfoContent = (props: { updates: IUserUpdate, setUpdates: (updates: IUserUpdate) => void }) => {
    const { updates, setUpdates } = props;
    const [sliderWidth, setSliderWidth] = useState(10),
        [acText, setAcText] = useState(""),
        { securities: { list: securities } } = useSecuritiesList();

    const acValues = useMemo(() => {
        const r = new RegExp(acText, "i");
        return acText ? gicsAC.filter((g, i) => r.test(g)) : [];
    }, [acText])
    const addIfMissing = (value: string) => {
        if (value && !updates.analyst_profile?.interests?.find((int: any) => int.toLowerCase() === value.toLowerCase())) {
            const _updates = { ...updates }
            _updates.analyst_profile!.interests = [..._updates.analyst_profile!.interests, value]
            setUpdates(_updates);
        }
        setAcText("");
    }
    const benches = securities.filter(s => s.is_benchmark).sort((a, b) => a.symbol.localeCompare(b.symbol)).map((value) => ({
        label: `${value.symbol} - ${value.security_name}`,
        value: value.symbol,
        iconUrl: value.logo_url
    }))

    return <ElevatedSection
        title="">
        <Text style={[questionStyle, { marginTop: sizes.rem0_5, textAlign: 'center' }]}>Tap to Modify Profile Picture</Text>
        <ProfileButton userId={''} profileUrl={updates.profile_url || ''} size={sizes.rem8} editable />
        <Text style={[questionStyle, { marginTop: sizes.rem0_5 }]}>Bio</Text>
        <KeyboardAvoidingInput
            value={updates.bio}
            displayButton={false}
            numLines={3}
            placeholder={'Tell people about yourself'}
            setValue={(text: string) => {
                const _updates = { ...updates }
                _updates.bio = text;
                setUpdates(_updates);
            }}
        />
        <Text style={questionStyle}>What is your investment strategy?</Text>
        <Picker
            placeholder='Select Strategy'
            value={updates?.analyst_profile?.investment_strategy}
            items={investmentStrats.map((value) => ({
                label: value,
                value
            }))}
            onSelect={(v) => {
                if (v) {
                    const _updates = { ...updates }
                    _updates.analyst_profile!.investment_strategy = investmentStrats[v.row];
                    setUpdates(_updates);
                }
            }}
        />
        <Text style={questionStyle}>How concentrated is your portfolio?</Text>
        <Slider
            containerStyle={{
                //marginLeft: sliderWidth * 0.05
            }}
            min={0}
            max={100}
            step={25}
            //sliderLength={sliderWidth * 0.9}
            values={[updates.analyst_profile!.portfolio_concentration]}
            onValuesChange={(v) => {
                const _updates = { ...updates }
                _updates.analyst_profile!.portfolio_concentration = v[0]
                setUpdates(_updates);
            }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text>Highly Diversified</Text>
            <Text>Very Concentrated</Text>
        </View>
        <Text style={questionStyle}>What benchmark do you follow?</Text>
        <Picker
            value={updates.analyst_profile?.benchmark}
            placeholder='Select Benchmark'
            items={benches}
            onSelect={(v) => {
                if (v) {
                    const _updates = { ...updates }
                    _updates.analyst_profile!.benchmark = benches[v.row].value;
                    setUpdates(_updates);
                }
            }}
        />
        <Text style={questionStyle}>Pick a few interest and specialties</Text>
        <View>
            <Autocomplete
                value={acText || ""}
                onChangeText={setAcText}
                placeholder="Interest &amp; Specialties"
                placement="bottom"
                accessoryRight={
                    (props) => <AddButton
                        onPress={() => addIfMissing(acText)}
                        height={(props?.style as any)?.height}
                        width={(props?.style as any)?.width}

                    />
                }
                onSelect={(idx) => addIfMissing(acValues[idx])}>{
                    acValues.map((v, i) => <AutocompleteItem key={i} title={v} />)
                }
            </Autocomplete>
        </View>
        {
            updates.analyst_profile?.interests.map((v, i) => <View style={{ padding: sizes.rem0_5, flexDirection: "row" }}>
                <Text style={{ textAlign: "left", flex: 1 }}>{v}</Text><Pressable onPress={() => {
                    const newInterest = [...updates.analyst_profile!.interests];
                    newInterest.splice(i, 1);
                    const _updates = { ...updates }
                    _updates.analyst_profile!.interests = newInterest;
                    setUpdates(_updates);
                }}><Icon name="close-outline" style={{ height: 24, aspectRatio: 1 }} /></Pressable>
            </View>)
        }
    </ElevatedSection>

}

const AdvancedTabContent = (props: { updates: IUserUpdate, setUpdates: (updates: IUserUpdate) => void }) => {

    const nav = useNavigation();
    const updates = props.updates;

    const onMentionCheckChanged = (isMentionChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.push_notifications.mentions = isMentionChecked;
        props.setUpdates(_updates)
    }
    const onUpvoteCheckChanged = (isUpvoteChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.push_notifications.upvotes = isUpvoteChecked
        props.setUpdates(_updates)
    }
    const onWatchlistChangeCheckChanged = (isWatchlistChangeChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.push_notifications.watchlist_changes = isWatchlistChangeChecked
        props.setUpdates(_updates)

    }
    const onPerformanceCheckChanged = (isPerformanceChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.portfolio_display.performance = isPerformanceChecked;
        props.setUpdates(_updates)
    }
    const onHoldingsCheckChanged = (isHoldingsChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.portfolio_display.holdings = isHoldingsChecked
        props.setUpdates(_updates)
    }
    const onTradesCheckChanged = (isTradesChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.portfolio_display.trades = isTradesChecked;
        props.setUpdates(_updates)
    }
    const onAnalystCheckChanged = (isAnalystChecked: boolean) => {
        const _updates = { ...updates }
        _updates.settings!.analyst = isAnalystChecked;
        props.setUpdates(_updates)
    }


    return <ElevatedSection title="" style={{ padding: 5 }}>
        <Section title="" style={{ padding: 10 }}>
            <SwitchField label='Analyst' checked={props.updates.settings?.analyst} onChange={onAnalystCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: fonts.medium, fontWeight: '500', alignSelf: 'center', color: AppColors.primary }} />
        </Section>
        <Section title='Display To Subscribers' style={{ padding: 5 }}>
            <SwitchField label='Performance' checked={props.updates.settings?.portfolio_display.performance} onChange={onPerformanceCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            <SwitchField label='Portfolio' checked={props.updates.settings?.portfolio_display.holdings} onChange={onHoldingsCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            <SwitchField label='Trades' checked={props.updates.settings?.portfolio_display.trades} onChange={onTradesCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 15 }}>
                <PrimaryButton style={{ width: "60%", paddingHorizontal: 4, backgroundColor: AppColors.secondary, borderColor: AppColors.secondary }} onPress={() => {
                    nav.navigate('Subscription')
                }}>
                    Manage Subscriptions
                </PrimaryButton>
            </View>
        </Section>
        <LinkBrokerageComponent />
        <Section title='Payment' style={{ padding: 10 }}>
            <Text>
                Coming Soon!
            </Text>
        </Section>
        <Section title='Notifications' style={{ padding: 10 }}>
            <Subsection title='Posts' alt={true}>
                <SwitchField label='Mentions' checked={props.updates.settings?.push_notifications.mentions} onChange={onMentionCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                <SwitchField label='Upvotes' checked={props.updates.settings?.push_notifications.upvotes} onChange={onUpvoteCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
            </Subsection>
            <Subsection title='Watchlists' alt={true}>
                {/*<SwitchField label='Price Movement' checked={watchlistPxCheck} onChange={onWatchlistPxCheckChanged} viewStyle={{flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5}} toggleStyle={{}} textStyle={{fontSize: 14, alignSelf: 'center'}}/>*/}
                <SwitchField label='Changes' checked={props.updates.settings?.push_notifications.watchlist_changes} onChange={onWatchlistChangeCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
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
    </ElevatedSection>

}