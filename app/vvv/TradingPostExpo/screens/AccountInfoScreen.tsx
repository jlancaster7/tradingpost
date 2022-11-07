import React, { useEffect, useState, useMemo, useRef } from "react"
import { IconifyIcon } from "../components/IconfiyIcon"
import { ElevatedSection, Section, Subsection } from "../components/Section"
import { SwitchField } from "../components/SwitchField"
import { Api } from "@tradingpost/common/api";
import { CreateAccountProps, sideMargin, useChangeLock } from "./create_account/shared"
import StripeLogo from '../../../../assets/node_modules/@iconify/icons-logos/stripe'
import CheckerLogo from '../../../../assets/node_modules/@iconify/icons-mdi/checkerboard'
//import { SetDashboardLayout } from "../../layouts/DashboardLayout"
//import { deleteAccount, UpdateUserProfile } from "../../apis/Authenticfation"
import { /*bindSwitch,*/ useReadonlyEntity, bindPicker } from "../utils/hooks"
import { ScrollWithButtons } from "../components/ScrollWithButtons"
import { View, Animated, Pressable } from "react-native"
import { useLinkTo } from "@react-navigation/native"
import { useSecuritiesList } from '../SecurityList'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openBrowserAsync } from 'expo-web-browser';
import { Autocomplete, AutocompleteItem, Icon, IndexPath, Text, TabView, Tab } from "@ui-kitten/components";
import { AddButton, EditButton } from "../components/AddButton";
import { Table } from "../components/Table";
import { bannerText, elevated, flex, paddView, paddViewWhite, sizes, thinBannerText, social as socialStyling, fonts } from "../style";
import { PrimaryButton } from "../components/PrimaryButton"
import { useAppUser } from "../Authentication"
import { investmentStrats, questionStyle, gicsAC } from './create_account/InvestmentInterestSection'
import { KeyboardAvoidingInput } from "../components/KeyboardAvoidingInput";
import { Picker } from "../components/Picker";
import { ProfileButton } from "../components/ProfileButton";
import { Slider } from "../components/Slider";
//import { HandleButton } from "./create_account/YourContentSection";
import { useTwitterAuth } from "../utils/third-party/twitter";
import { social } from "../images";
import { AppColors } from "../constants/Colors";
import { useToast } from "react-native-toast-notifications";
import { AccountSettingsScreen } from './AccountSettingsScreen';
import { useGoogleAuth } from "../utils/third-party/youtube";
import { YourContentComponent } from "../components/YourContentComponent";
import { LinkBrokerageComponent } from "../components/LinkBrokerageComponent";

export function AccountInfoScreen(props: any) {
    const { appUser, authToken, signIn } = useAppUser(),
        [index, setIndex] = useState(0),
        linkTo = useLinkTo<any>(),
        toast = useToast(),
        opacityAnim = useRef(new Animated.Value(0)).current;

    //########################################################################################################################
    //Logic for the 'Account Settings' Tab
    //########################################################################################################################
    const [mentionCheck, setMentionCheck] = useState<boolean>(appUser?.settings?.push_notifications.mentions === undefined ? true : appUser?.settings?.push_notifications.mentions),
        [upvotesCheck, setUpvotesCheck] = useState<boolean>(appUser?.settings?.push_notifications.upvotes === undefined ? true : appUser?.settings?.push_notifications.upvotes),
        [watchlistChangeCheck, setWatchlistChangeCheck] = useState<boolean>(appUser?.settings?.push_notifications.watchlist_changes === undefined ? true : appUser?.settings?.push_notifications.watchlist_changes),
        [performanceCheck, setPerformanceCheck] = useState<boolean>(appUser?.settings?.portfolio_display.performance === undefined ? false : appUser?.settings?.portfolio_display.performance),
        [holdingsCheck, setHoldingsCheck] = useState<boolean>(appUser?.settings?.portfolio_display.holdings === undefined ? false : appUser?.settings?.portfolio_display.holdings),
        [tradesCheck, setTradesCheck] = useState<boolean>(appUser?.settings?.portfolio_display.trades === undefined ? false : appUser?.settings?.portfolio_display.trades),
        [analystCheck, setAnalystCheck] = useState<boolean>(appUser?.settings?.analyst === undefined ? false : appUser?.settings?.analyst);

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
    //########################################################################################################################

    //########################################################################################################################
    //Logic for the 'Account Information' Tab
    //########################################################################################################################
    const anaylistProfile = useReadonlyEntity(appUser?.analyst_profile || {
        investment_strategy: "",
        portfolio_concentration: 50,
        benchmark: "",
        interests: []
    });
    const [bio, setBio] = useState(appUser?.bio),
        [sliderWidth, setSliderWidth] = useState(anaylistProfile.data.portfolio_concentration),
        [acText, setAcText] = useState(""),
        { securities: { list: securities } } = useSecuritiesList();

    const acValues = useMemo(() => {
        const r = new RegExp(acText, "i");
        return acText ? gicsAC.filter((g, i) => r.test(g)) : [];
    }, [acText])
    const addIfMissing = (value: string) => {
        if (value && !anaylistProfile.data.interests.find((int: any) => int.toLowerCase() === value.toLowerCase())) {
            anaylistProfile.update({
                "interests": [...anaylistProfile.data.interests, value]
            })
        }
        setAcText("");
    }
    const benches = securities.filter(s => s.is_benchmark).sort((a, b) => a.symbol.localeCompare(b.symbol)).map((value) => ({
        label: `${value.symbol}
${value.security_name}`,
        value: value.symbol,
        iconUrl: value.logo_url
    }))
    //########################################################################################################################


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
                        await Api.User.update(appUser?.id || '', {
                            bio: bio,
                            analyst_profile: anaylistProfile.data
                        });
                        await Api.User.update(appUser?.id || '', {
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

                        linkTo('/dash/feed')
                        //anaylistProfile.resetData(anaylistProfile.data);
                        //props.toastMessage("Account Information updated!");
                    }
                    catch (ex) {
                        console.error(ex);
                        //props.toastMessage("Unable to update profile.");
                    }
                }
            }
        }}>
        <View style={[flex, { margin: sideMargin, marginTop: 12 }]} onLayout={(ev) => {
            setSliderWidth(ev.nativeEvent.layout.width)
        }} >
            <TabView indicatorStyle={{ marginTop: 26 }}
                style={{ marginVertical: sizes.rem0_5 }}
                tabBarStyle={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}
                selectedIndex={index}
                onSelect={setIndex}
            >
                <Tab title={'Account Info'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
                    <ElevatedSection title="" style={{ padding: 5 }}>
                        <Text style={[questionStyle, { marginTop: sizes.rem0_5, textAlign: 'center' }]}>Tap to Modify Profile Picture</Text>
                        <ProfileButton userId={appUser?.id || ''} profileUrl={appUser?.profile_url ? appUser?.profile_url : ""} size={sizes.rem8} editable />
                        <Text style={[questionStyle, { marginTop: sizes.rem0_5 }]}>Bio</Text>
                        <KeyboardAvoidingInput
                            value={bio}
                            displayButton={false}
                            numLines={3}
                            placeholder={'Tell people about yourself'}
                            //rightIcon=
                            setValue={setBio}
                        //item_id={props.route.params.post._source.id}
                        //clicked={[commentAdded, setCommentAdded]}
                        //onClick={() => {}}
                        />
                        <Text style={questionStyle}>What is your investment strategy?</Text>
                        <Picker
                            placeholder='Select Strategy'
                            value={anaylistProfile.data.investment_strategy}
                            items={investmentStrats.map((value) => ({
                                label: value,
                                value
                            }))}
                            {...bindPicker(anaylistProfile, "investment_strategy", {
                                fromType: (v) => {
                                    if (v) {
                                        return investmentStrats[v.row]
                                    }
                                    return "";
                                },
                                toType: (v: any) => {
                                    return new IndexPath(investmentStrats.findIndex(v => v === v));
                                }
                            })}
                        />
                        <Text style={questionStyle}>How concentrated is your portfolio?</Text>
                        <Slider
                            containerStyle={{
                                marginLeft: sliderWidth * 0.05
                            }}
                            min={0}
                            max={100}
                            step={25}
                            sliderLength={sliderWidth * 0.9}
                            values={[anaylistProfile.data.portfolio_concentration || 50]}
                            onValuesChange={(v) => {
                                anaylistProfile.update({
                                    portfolio_concentration: v[0]
                                })
                            }
                            }
                        />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                            <Text>Highly Diversified</Text>
                            <Text>Very Concentrated</Text>
                        </View>
                        <Text style={questionStyle}>What benchmark do you follow?</Text>
                        <Picker
                            value={anaylistProfile.data.benchmark}
                            placeholder='Select Benchmark'
                            items={benches}
                            {...bindPicker(anaylistProfile, "benchmark", {
                                fromType: (v) => {
                                    if (v) {
                                        return benches[v.row].value
                                    }
                                    return "";
                                },
                                toType: (v) => {
                                    return new IndexPath(benches.findIndex(v => v === v));
                                }
                            })}
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
                            anaylistProfile.data.interests.map((v, i) => <View style={{ padding: sizes.rem0_5, flexDirection: "row" }}>
                                <Text style={{ textAlign: "left", flex: 1 }}>{v}</Text><Pressable onPress={() => {
                                    const newInterest = [...anaylistProfile.data.interests];
                                    newInterest.splice(i, 1);
                                    anaylistProfile.update({
                                        interests: newInterest
                                    })
                                }}><Icon name="close-outline" style={{ height: 24, aspectRatio: 1 }} /></Pressable>
                            </View>)
                        }
                    </ElevatedSection>
                </Tab>
                <Tab title={'Your Content'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
                    <YourContentComponent />
                </Tab>
                <Tab title={'Advanced'} style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
                    <ElevatedSection title="" style={{ padding: 5 }}>
                        <Section title="" style={{ padding: 10 }}>
                            <SwitchField label='Analyst' checked={analystCheck} onChange={onAnalystCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: fonts.medium, fontWeight: '500', alignSelf: 'center', color: AppColors.primary }} />
                        </Section>
                        <Section title='Display' style={{ padding: 10 }}>
                            <SwitchField label='Performance' checked={performanceCheck} onChange={onPerformanceCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                            <SwitchField label='Portfolio' checked={holdingsCheck} onChange={onHoldingsCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                            <SwitchField label='Trades' checked={tradesCheck} onChange={onTradesCheckChanged} viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 5 }} toggleStyle={{}} textStyle={{ fontSize: 14, alignSelf: 'center' }} />
                        </Section>
                       <LinkBrokerageComponent props={props} />
                        <Section title='Payment' style={{ padding: 10 }}>
                            <Text>
                                Coming Soon!
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
                    </ElevatedSection>
                </Tab>
            </TabView>

        </View>
    </ScrollWithButtons>
}