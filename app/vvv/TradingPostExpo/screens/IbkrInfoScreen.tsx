import React, { useEffect, useState, useMemo, useRef } from "react"
import { View, Animated, Pressable, Linking } from "react-native"
import { Api, Interface } from "@tradingpost/common/api"
//import { LinkBrokerageComponent } from "../components/LinkBrokerageComponent";
import { elevated, flex, fonts, paddView, paddViewWhite, row, sizes } from "../style"
import { ElevatedSection, Section, Subsection } from "../components/Section"
import { Autocomplete, AutocompleteItem, Button, Icon, IndexPath, Text, Layout } from "@ui-kitten/components"
import { AddButton } from "../components/AddButton";
import { useReadonlyEntity } from "../utils/hooks";
import { ScrollWithButtons } from "../components/ScrollWithButtons";
import { getHivePool } from "@tradingpost/common/db";


export function IbkrInfoScreen(props: any) {
    const [acText, setAcText]  = useState('')
    let [submittedText, setSubmittedText] = useState('') 
    //const [accountIds, setAccountIds] = useState<string[]>([]);
    
    const accountIds = useReadonlyEntity<{ids: string[]}>({
        ids: []
    })
    useEffect(()=> {
        (async () => {
            if (submittedText === '') {
                return
            }
            
            accountIds.update({ids: [...accountIds.data.ids, submittedText]});
            console.log('use effect')
            console.log(accountIds)
            setSubmittedText('')
        })()

    },[submittedText])
    return (
        <ScrollWithButtons
        fillHeight={true}
        buttons={{
            left: {
                text: 'Go back',
                onPress: async () => {
                    try {
                        props.navigation.goBack();
                    } catch (e) {
                     console.error(e);
                    } 
                }
            },
            right: {
                text: 'Continue',
                onPress: async () => {
                   try {
                        if (!accountIds.data.ids.length) {
                            return
                        }
                        await Api.Ibkr.extensions.insertNewAccounts({account_ids: accountIds.data.ids});
                        const body = emailBody(accountIds.data.ids);
                        Linking.openURL(`mailto:reportingintegration@interactivebrokers.com?subject=IBKR/TradingPost Reporting Integration&body=${body}`) 
                    
                   } catch (e) {
                        console.error(e);
                   }
                }
            }
        }}>
        <View style={[flex, { margin: sizes.rem1}]}>
            <View style={{marginBottom: 20}}>
                <Text>
                    {instructions}
                </Text>
            </View>
            <View>
                <Autocomplete
                    value={acText || ""}
                    onChangeText={setAcText}
                    placeholder="Account Ids"
                    placement="bottom"
                    onSubmitEditing={() => {
                        console.log('button press')
                        setSubmittedText(acText)
                        setAcText('')

                    }}
                    
                    accessoryRight={
                        (props) => <AddButton
                            onPress={() => {
                                console.log('button press')
                                setSubmittedText(acText)
                                setAcText('')

                            }}
                            
                            height={(props?.style as any)?.height * 1.5}
                            width={(props?.style as any)?.width * 1.5}

                        />
                    }
                    >
                    
                </Autocomplete>
            </View>
            <View key={`view_id_${accountIds.data.ids.length}`}>
                    {
                    accountIds.data.ids.map((v,i)=> <View key={`id_${i}`} style={{ padding: sizes.rem0_5, flexDirection: "row" }}><Text style={{ textAlign: "left", flex: 1 }}>{v}</Text></View>)
                    }
            </View>
            <View key='1' style={{position: 'absolute', bottom: 0}}>
                <Text style={{textAlign: 'left', fontSize: fonts.xSmall}}>
                    {note}
                </Text>
                <Text style={{color: '#0000EE', marginVertical: 10, fontSize: fonts.xSmall}}
                    onPress={()=> 
                        Linking.openURL('https://guides.interactivebrokers.com/ibrit/topics/reporting_integration_process.htm')}>
                        {'IBKR Reporting Integration Process'}
                </Text>
            </View>
        </View>
    </ScrollWithButtons>
    )

}

const emailBody = (accountIds: string[]) => { 
    return `To Whom It May Concern,

I would like to integrate my Interactive Brokers reporting data with the TradingPost feed.

I would like to include a historical position and transactions file.

I would like to include the accounts under the below advisory account #:
${accountIds.join('\n')}

Best,

[Enter your legal name here]`
}

const instructions = `In order to link your IBKR account to TradingPost, we need you to send an email to IBKR indicating that you would give TradingPost permission to reports on your historical positions and trades.\n\nPlease enter the Account IDs that you would like to link to TradingPost below. \n\nAfter entering them in, when you click "Continue" we will generate the necessary email for you to send to IBKR's Reporting Integration Team.`

const note = `Note:
Granting us this access in no way gives us any authority over your account.

You can check out the below IBKR link if you have any concerns:`