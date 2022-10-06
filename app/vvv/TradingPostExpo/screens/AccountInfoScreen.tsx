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
import { useSecuritiesList} from '../SecurityList'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openBrowserAsync } from 'expo-web-browser';
import { Autocomplete, AutocompleteItem, Icon, IndexPath, Text, TabView, Tab } from "@ui-kitten/components";
import { AddButton, EditButton } from "../components/AddButton";
import { Table } from "../components/Table";
import { bannerText, flex, paddView, paddViewWhite, sizes, thinBannerText, social as socialStyling, fonts } from "../style";
import { PrimaryButton } from "../components/PrimaryButton"
import { TabScreenProps } from "../navigation"
import { useAppUser } from "../Authentication"
import { investmentStrats, questionStyle, gicsAC } from './create_account/InvestmentInterestSection'
import { KeyboardAvoidingInput } from "../components/KeyboardAvoidingInput";
import { Picker } from "../components/Picker";
import { ProfileButton } from "../components/ProfileButton";
import { Slider } from "../components/Slider";
import { HandleButton } from "./create_account/YourContentSection";
import { useTwitterAuth } from "../utils/third-party/twitter";
import { social } from "../images";
import { AppColors } from "../constants/Colors";
import { useToast } from "react-native-toast-notifications";


export function AccountInfoScreen(props: TabScreenProps) {
    const { appUser, authToken, signIn } = useAppUser();
    const [index, setIndex] = useState(0),
        [inputMessage, setInputMessage] = useState(''),
        [inputPlatform, setInputPlatform] = useState(''),
        [inputValue, setInputValue] = useState('')

    const getToken = useTwitterAuth();
    const toast = useToast();
    //console.log(appUser?.claims);
    let twitterHandle: any;
    let setTwitterHandle: any;
    let substackUsername: any;
    let setsubstackUsername: any;
    let spotifyShow: any;
    let setSpotifyShow: any;
    let youtubeChannel: any;
    let setYoutubeChannel: any;
    if (appUser?.claims) {
        [twitterHandle, setTwitterHandle] = useState(appUser?.claims.find(c => c.platform === "twitter")?.platform_user_id);
        [substackUsername, setsubstackUsername] = useState(appUser?.claims.find(c => c.platform === "substack")?.platform_user_id);
        [spotifyShow, setSpotifyShow] = useState(appUser?.claims.find(c => c.platform === "spotify")?.platform_user_id);
        [youtubeChannel, setYoutubeChannel] = useState(appUser?.claims.find(c => c.platform === "youtube")?.platform_user_id);
    } 
    else {
        [twitterHandle, setTwitterHandle] = useState('');
        [substackUsername, setsubstackUsername] = useState('');
        [spotifyShow, setSpotifyShow] = useState('');
        [youtubeChannel, setYoutubeChannel] = useState('');
    }



    const anaylistProfile = useReadonlyEntity(appUser?.analyst_profile || {
        investment_strategy: "",
        portfolio_concentration: 50,
        benchmark: "",
        interests: []
    });
    const [bio, setBio] = useState(appUser?.bio),
        [sliderWidth, setSliderWidth] = useState(anaylistProfile.data.portfolio_concentration),
        linkTo = useLinkTo<any>(),
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

    const opacityAnim = useRef(new Animated.Value(0)).current;

    return <ScrollWithButtons 
    buttons={{
        left:  {
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
        <View style={[flex, { margin: sideMargin }]} onLayout={(ev) => {
                    setSliderWidth(ev.nativeEvent.layout.width)
                }} >
            <ElevatedSection title="" style={{padding: 5}}>
                <TabView indicatorStyle={{marginTop: 26
                        }} style={{ marginVertical: sizes.rem0_5 }} selectedIndex={index} onSelect={ setIndex }>
                <Tab title={'Account Information'}>
                    <View>
                        <Text style={[questionStyle, {marginTop: sizes.rem0_5, textAlign: 'center'}]}>Tap to Modify Profile Picture</Text>
                        <ProfileButton userId={appUser?.id || ''} profileUrl={appUser?.profile_url ? appUser?.profile_url :  ""} size={sizes.rem8} editable />
                        <Text style={[questionStyle, {marginTop: sizes.rem0_5}]}>Bio</Text>
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
                        </View>
                    </Tab>
                    <Tab title={'Your Content'}>
                        <View>
                            <Text style={[thinBannerText, {fontSize: fonts.medium, lineHeight: fonts.medium * 1.5}]}>TradingPost aggregates content across several social platforms.</Text>
                            <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                                <HandleButton
                                    title={twitterHandle}
                                    icon={social.TwitterLogo}
                                    onPress={() => {
                                        getToken().then((handle) => {
                                            setTwitterHandle(handle)
                                        })
                                    }}
                                    iconPadd={sizes.rem1}
                                />
                                <HandleButton title={youtubeChannel} icon={social.YouTubeLogo} 
                                    iconPadd={sizes.rem1} 
                                    onPress={()=> {
                                        setInputMessage('Please enter your Substack username as it appears in your profile URL');
                                        setInputPlatform('youtube')
                                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: "row", marginHorizontal: sizes.rem2, marginBottom: sizes.rem1 }}>
                                <HandleButton title={substackUsername} icon={social.SubstackLogo}
                                    iconPadd={sizes.rem1}
                                    currentColor={socialStyling.substackColor}
                                    onPress={()=> {
                                        setInputMessage('Please enter your Substack username as it appears in your profile URL');
                                        setInputPlatform('substack')
                                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                                    }}
                                />
                                <HandleButton title={spotifyShow} icon={social.SpotifyLogo}
                                    iconPadd={sizes.rem0_5}
                                    onPress={()=> {
                                        setInputMessage("Please enter your Spotify Podcast's Profile URL.\nIn the Spotify App, this can be found by going to your Podcasts's Profile Page, clicking the 'Share' Icon and clicking 'Copy Link'.");
                                        setInputPlatform('spotify')
                                        //await Api.User.extensions.linkSocialAccount({platform: 'substack', platform_idenifier: ''}) ;  
                                    }}
                                />
                            </View>
                            <Text style={[thinBannerText, {fontSize: fonts.medium, lineHeight: fonts.medium * 1.5}]}>Sign in to your account(s) above to claim or add your content.</Text>
                            <View style={inputPlatform === '' ? {display: 'none'} : {display: 'flex'}}>
                                <Text>
                                    {inputMessage}
                                </Text>
                                <KeyboardAvoidingInput
                                    placeholder={'Enter here'}
                                    value={inputValue}
                                    setValue={setInputValue}
                                    displayButton={true}
                                    numLines={2}
                                    rightIcon={(props: any) => <Icon
                                        fill={AppColors.secondary}
                                        name="plus-square" height={35} width={35} style={{ height: 35, width: 35, padding: 0, alignContent: 'center'}} />}
                                
                                    onClick={async (r: any, s: any, t: any) => {
                                        const result = await Api.User.extensions.linkSocialAccount({platform: inputPlatform, platform_idenifier: r});
                                        if (result === '') {
                                            toast.show(`${inputPlatform} Account Link Failed. Please try again or email contact@tradingpostapp.com for assistance.`)
                                        }
                                        s('')
                                    }}
                                    />
                            </View>
                        </View>
                        
                    </Tab>
                </TabView>
            </ElevatedSection>
        </View>
    </ScrollWithButtons>
}