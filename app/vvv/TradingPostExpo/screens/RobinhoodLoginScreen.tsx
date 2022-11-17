import React, { useEffect, useState, useMemo, useRef } from "react"
import { View, Animated, Pressable, Linking } from "react-native"
import { ITextField, TextField } from '../components/TextField';
import { Api, Interface } from "@tradingpost/common/api"
//import { LinkBrokerageComponent } from "../components/LinkBrokerageComponent";
import { elevated, flex, fonts, paddView, paddViewWhite, row, sizes } from "../style"
import { ElevatedSection, Section, Subsection } from "../components/Section"
import { Autocomplete, AutocompleteItem, Button, Icon, IndexPath, Text, Layout, TabView, Tab } from "@ui-kitten/components"
import { AddButton } from "../components/AddButton";
import { useIsKeyboardVisible, useReadonlyEntity } from "../utils/hooks";
import { ButtonPanel, ScrollWithButtons } from "../components/ScrollWithButtons";
import { getHivePool } from "@tradingpost/common/db";
import { PrimaryButton } from "../components/PrimaryButton";
import { RobinhoodLogo } from '../images'; 
import { Header } from "../components/Headers";
import { SecondaryButton } from "../components/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { RobinhoodLoginResponse, RobinhoodLoginStatus } from "@tradingpost/common/api/entities/extensions/Brokerage";
import { useToast } from "react-native-toast-notifications";

export function RobhinhoodLoginScreen(props: any) {
    const nav = useNavigation();
    const [username, setUsername] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        [multifactor, setMultifactor] = useState<string>(''),
        [selectedIndex, setSelectedIndex] = useState(0),
        [deviceToken, setDeviceToken] = useState<string>(''),
        toast = useToast();
    
    
    return (
        <View style={paddView}>
            <TabView
                selectedIndex={selectedIndex}
                onSelect={index => setSelectedIndex(isNaN(index) ? 0 : index)}
                style={{ width: "100%" }}
                indicatorStyle={{ height: 0 }}
                tabBarStyle={{ height: 0 }}
            >
                <Tab>
                    <ElevatedSection title="" style={{padding: sizes.rem1}}>
                        <View style={{padding: sizes.rem1, borderRadius: 20, overflow: 'hidden', aspectRatio: 1, height: '40%', justifyContent: 'center', alignSelf: 'center'}}>
                            <RobinhoodLogo style={{}}  height={"100%"} width={'100%'}/>
                        </View>
                        <View>
                            <Header text="Robinhood Login"/>
                            <TextField
                                //label="Robhinhood Username" 
                                placeholder="Robinhood Username"
                                onChangeText={(name: string) => setUsername(name)}
                                />
                            <TextField
                                //label="Robhinhood Password" 
                                placeholder="Robinhood Password"
                                onChangeText={(pass: string) => setPassword(pass)}
                                />
                        </View>
                            <ButtonPanel
                                viewProps={{borderTopWidth: 0,
                                            flexDirection: "row", 
                                            paddingTop: sizes.rem1,
                                            paddingBottom: 0,
                                            justifyContent: "space-evenly", 
                                            zIndex: 1000
                                        }}
                                left={{
                                    text: 'Go back',
                                    onPress: async () => {
                                        nav.goBack();
                                    }
                                }}
                                right={{
                                    text: 'Login',
                                    onPress: async () => {
                                        //Api call, on success go on to the MFA page
                                        let initialLogin = {} as RobinhoodLoginResponse
                                        if (!username || !password) {
                                            toast.show('Please enter username and password')
                                            return
                                        }
                                        else {
                                            initialLogin = await Api.Brokerage.extensions.robinhoodLogin({username: username, password: password, mfaCode: null})
                                        }
                                        if (initialLogin.status === 'MFA' as RobinhoodLoginStatus) {
                                            setSelectedIndex(1);
                                        }
                                        else if (initialLogin.status === 'ERROR') {
                                            toast.show('Login failed, please re-enter username and password!')
                                            setPassword('')
                                            console.log('failed login!')
                                        }
                                    }
                                }}
                                />
                    </ElevatedSection>
                </Tab>
                <Tab>
                    <ElevatedSection title="" style={{padding: sizes.rem1}}>
                        <View style={{padding: sizes.rem1, borderRadius: 20, overflow: 'hidden', aspectRatio: 1, height: '40%', justifyContent: 'center', alignSelf: 'center'}}>
                            <RobinhoodLogo style={{}}  height={"100%"} width={'100%'}/>
                        </View>
                        <Header text="Robinhood Multifactor Authentication"/>
                        <TextField
                            //label="Robhinhood Password" 
                            placeholder="Robinhood Multifactor Auth Code"
                            onChangeText={(mfa: string) => setMultifactor(mfa)}
                        />
                        <View style={{paddingVertical: sizes.rem1, alignItems: 'center'}}>
                            <PrimaryButton 
                                style={{width: '50%'}}
                                onPress={async () => {
                                    //Api call, on success go on to the MFA page
                                    const mfaLogin = await Api.Brokerage.extensions.robinhoodLogin({username: username, password: password, mfaCode: multifactor})
                                    if (mfaLogin.status === 'SUCCESS' as RobinhoodLoginStatus) {
                                        toast.show("You've successfully linked your Robinhood account to TradingPost!")
                                        nav.navigate('BrokeragePicker')
                                    }

                                }}
                            >
                                Submit
                            </PrimaryButton>
                        </View>
                       
                    </ElevatedSection>
                </Tab>
            </TabView>
        </View>
    )


}