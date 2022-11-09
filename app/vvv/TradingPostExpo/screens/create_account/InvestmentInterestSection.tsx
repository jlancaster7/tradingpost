import React, { useEffect, useMemo, useState } from "react"
import { Autocomplete, AutocompleteItem, Button, Icon, IndexPath, Text, Layout } from "@ui-kitten/components"
//import { referenceData } from "../../apis/ReferenceData"
import { ElevatedSection, Section } from "../../components/Section"
import { PlusIcon } from "../../images"
import { bannerText, flex, noMargin, paddView, sizes, thinBannerText } from "../../style"
import { Picker } from '../../components/Picker'
import {
    CreateAccountProps,
    sideMargin
} from "./shared"

import {
    //bindMultiPicker,
    bindPicker,
    useOpacityAnim,
    useReadonlyEntity
} from "../../utils/hooks"
import { useSecuritiesList } from '../../SecurityList'
//import { UpdateUserProfile } from "../../apis/Authentication"
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { Alert, Pressable, TextStyle, View } from "react-native"
import { Slider } from "../../components/Slider"
import { AppColors } from "../../constants/Colors"
import { Api } from "@tradingpost/common/api"
import { AddButton } from "../../components/AddButton"
import { useLinkTo } from "@react-navigation/native";
import { KeyboardAvoidingInput } from "../../components/KeyboardAvoidingInput"

//import { AppConfig } from "../../apis/ApplicationApi"


export const investmentStrats = [
    'Buy & Hold',
    'Growth-Focused',
    'Swing Trading',
    'Momentum',
    'Day Trading',
    'Index Investing',
    'Value-Focused',
    'Long/Short',
    'Opportunistic ',
    'Concetrated',
    'Diversified'
];
export const questionStyle = { fontSize: 16, marginBottom: sizes.rem1, marginTop: sizes.rem1_5 } as TextStyle;

export const gicsAC = ['SaaS',
    'Biotech',
    'AdTech',
    'Tech',
    'Fintech',
    'Specialty Finance',
    'Aero/Defense',
    'Industrial',
    'Medtech',
    'Cloud',
    'Consumer',
    'Banks',
    'Industrials',
    'Healthcare',
    'Housing',
    'Electric Vehicles',
    'Renewable Energy',
    'Oil and Gas',
    'Metals and Mining',
    'Semiconductors',
    'Cybersecurity',
    'Metaverse',
    'Crypto',
    'Transportation',
    'Airlines',
    'Auto',
    'Healthcare',
    'Retail',
    'E-commerce',
    'Insurance',
    'Gambling',
    'Quality',
    'Deep Dives',
    'General Market',
    'Valuation',
    'Technicals',
    'Investment Process',
    'Small Caps',
    'Macro',
    'News',
    'Venture Capital',
    'Emerging Markets',
    'Portfolio Management',
    'Data Driven',
    'Industry Expert',
    'Financial Coach',
    'Businesses',
    'Special Situations',
    'Activist'].sort()


export function InvestmentInterestSection(props: CreateAccountProps) {
    const { AppearView } = useOpacityAnim();
    const anaylistProfile = useReadonlyEntity(props.user.data.analyst_profile || {
        investment_strategy: "",
        portfolio_concentration: 50,
        benchmark: "",
        interests: []
    });
    //props.user.data.investment_interests || { interestLevel: 50 }
    const { securities: { list: securities } } = useSecuritiesList(),
        [lockButtons, setLockButtons] = useState(false),
        [bio, setBio] = useState(''),
        [sliderWidth, setSliderWidth] = useState(100),
        linkTo = useLinkTo<any>(),
        [acText, setAcText] = useState("");
    const acValues = useMemo(() => {
        const r = new RegExp(acText, "i");
        return acText ? gicsAC.filter((g, i) => r.test(g)) : [];
    }, [acText])
    const addIfMissing = (value: string) => {
        if (value && !anaylistProfile.data.interests.find((int) => int.toLowerCase() === value.toLowerCase())) {
            anaylistProfile.update({
                "interests": [...anaylistProfile.data.interests, value]
            })
        }
        setAcText("");
    }
    const benches = securities.filter(s => s.is_benchmark).sort((a, b) => a.symbol.localeCompare(b.symbol)).map((value) => ({
        label: `[${value.symbol}] ${value.security_name}`,
        value: value.symbol,
        iconUrl: value.logo_url
    }))
    return <ScrollWithButtons
        buttons={
            {
                locked: lockButtons,
                left: {
                    text: "Nevermind",
                    onPress: async () => {
                        const defaultSettings = {
                            analyst: false,
                            push_notifications: {
                                mentions: true,
                                upvotes: true,
                                watchlist_changes: true,
                            },
                            portfolio_display: {
                                performance: false,
                                holdings: false,
                                trades: false
                            }
                        }
                        await Api.User.update(props.user.data.id, {
                            settings: defaultSettings
                        })
                        linkTo('/create/profilepicture')
                    }
                },
                right: {
                    text: "Continue",
                    onPress: async () => {
                        setLockButtons(true);
                        try {
                            await Api.User.update(props.user.data.id, {
                                bio: bio,
                                analyst_profile: anaylistProfile.data
                            });
                            anaylistProfile.resetData(anaylistProfile.data);
                            props.user.resetData(props.user.data);


                            linkTo('/create/linkbrokerage')
                        } catch (ex: any) {
                            console.error(ex);
                            props.toastMessage("Unable to update profile");
                            setLockButtons(false);
                        }
                    }
                }
            }
        }>
        <View style={[paddView, { paddingBottom: 0 }]}>
            <ElevatedSection title="" style={{ paddingVertical: 4 }}>
                <AppearView onLayout={(ev) => {
                    setSliderWidth(ev.nativeEvent.layout.width)
                }} style={[flex]}>
                    <Text style={[thinBannerText, { marginHorizontal: 0, marginTop: sizes.rem0_5 }]}>Welcome Analyst! Tell us a bit about yourself</Text>
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
                            toType: (v) => {
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
                </AppearView>
            </ElevatedSection>
        </View>
    </ScrollWithButtons>
}

