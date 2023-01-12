import { NavigationProp } from "@react-navigation/native";
import { Api } from "@tradingpost/common/api";
import { ISubscriberList, IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { Text, Tab, TabView, Avatar } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { useAppUser } from "../Authentication";
import { DeleteButton, EditButton, SettingsButton } from "../components/AddButton";
import { Picker } from "../components/Picker";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProfileButton } from "../components/ProfileButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { ElevatedSection } from "../components/Section";
import { SwitchField } from "../components/SwitchField";
import { Table } from "../components/Table";
import { RootStackScreenProps } from "../navigation/pages";
import { paddView, sizes } from "../style";
import { useReadonlyEntity } from "../utils/hooks";
import { AwaitedReturn } from "../utils/misc";

export const SubscriptionScreen = (props: RootStackScreenProps<"Subscription">) => {
    const [index, setIndex] = useState(0);
    //const [] = useState<  >()
    //  useEffect(()=>{},[])
    const mySubscriptionsCall = Api.Subscriber.extensions.getBySubscriber,
        mySubscribersCall = Api.Subscriber.extensions.getByOwner,
        [subscriptions, setSubscriptions] = useState<AwaitedReturn<typeof mySubscriptionsCall>>(),
        [subscribers, setSubscribers] = useState<AwaitedReturn<typeof mySubscribersCall>>(),
        [buttonClick, setButtonClick] = useState(false);
    const { loginState } = useAppUser();
    const appUser = loginState?.appUser;

    useEffect(() => {
        (async () => {
            try {
                const subtionTask = mySubscriptionsCall();
                const suberTask = mySubscribersCall();
                const [subscriptions, subscribers] = await Promise.all([subtionTask, suberTask])
                setSubscriptions(subscriptions);
                setSubscribers(subscribers);
            }
            catch (ex) {
                console.error(ex);
            }
        })()

    }, [])
    useEffect(() => {
        (async () => {
            try {
                const subtionTask = mySubscriptionsCall();
                const suberTask = mySubscribersCall();
                const [subscriptions, subscribers] = await Promise.all([subtionTask, suberTask])
                setSubscriptions(subscriptions);
                setSubscribers(subscribers);
            }
            catch (ex) {
                console.error(ex);
            }
        })()

    }, [buttonClick])

    return <View style={paddView}><ElevatedSection title="Manage Subscriptions"
        button={(p) => <SettingsButton onPress={() => {
            if (appUser?.settings?.analyst) {
                props.navigation.navigate("SubscriptionSettings");
            }
        }} {...p} />}
    ><TabView
        indicatorStyle={{
            marginTop: 26
        }} style={{ marginVertical: sizes.rem0_5 }} selectedIndex={index} onSelect={appUser?.settings?.analyst ? setIndex : undefined}>
            <Tab title="Subscriptions">
                <Table
                    rowPressed={(r) => {
                        props.navigation.navigate("Profile", {
                            userId: r.subscription?.[0].user_id
                        })
                    }}
                    data={subscriptions}
                    columns={
                        [
                            {
                                headerStyle: {
                                    height: 20,
                                    width: 20,
                                    flex: 0,
                                    flexBasis: 22
                                },
                                alias: " ",
                                field: (item) => {
                                    const user = item.item.subscription[0].user[0];
                                    return <ProfileButton userId={user.id} size={20} profileUrl={user.profile_url || ""} />
                                }
                            },
                            {
                                alias: "Analyst",
                                align: "left",
                                field: "subscription",
                                style: {
                                    paddingLeft: 4
                                },
                                stringify: (k: ISubscriberList["subscription"]) => {
                                    return '@' + k[0].user[0].handle
                                }
                            },
                            /*{
                                alias: "Cost",
                                align: "left",
                                field: "subscription",
                                headerStyle: {
                                    textAlign: 'center'
                                },
                                style: {
                                    textAlign: 'center',
                                    //paddingLeft: 6
                                },
                                stringify: (k: ISubscriberList["subscription"]) => {
                                    return String(String(k[0].cost) === '$0.00' ? 'Free' : k[0].cost)
                                }
                            },*/
                            {
                                alias: "Since",
                                field: "start_date",
                                stringify: (k: ISubscriberList["start_date"]) => {
                                    return new Date(k).toLocaleDateString();
                                }
                            }
                        ]
                    }
                />
            </Tab>
            <Tab title="Subscribers">
                <Table
                    rowPressed={(r) => {
                        props.navigation.navigate("Profile", {
                            userId: r.subscription?.[0].user_id
                        })
                    }}
                    data={subscribers}
                    columns={
                        [
                            {
                                headerStyle: {
                                    height: 20,
                                    width: 20,
                                    flex: 0,
                                    flexBasis: 22
                                },
                                alias: " ",
                                field: (item) => {
                                    const user = item.item.user[0];
                                    return <ProfileButton userId={user.id} size={20} profileUrl={user.profile_url || ""} />
                                }
                            },
                            {
                                alias: "Subscriber",
                                align: "left",
                                field: "user",
                                style: {
                                    paddingLeft: 4
                                },
                                stringify: (k: ISubscriberList["user"]) => {
                                    return '@' + k[0].handle
                                }
                            },
                            {
                                alias: "Status",
                                field: (item) => {
                                    if (item.item.approved) {
                                        return <Text>Approved</Text>;
                                    }
                                    else {
                                        return <SecondaryButton
                                            children={'Approve'}
                                            style={{
                                                backgroundColor: "#35A265", borderColor: "#35A265",
                                                minHeight: 26,
                                                height: 26,
                                                minWidth: 80,
                                                width: 80,
                                                paddingVertical: 0,
                                                paddingHorizontal: 0
                                            }}
                                            onPress={async () => {
                                                item.item.approved = true;
                                                await Api.Subscriber.update(item.item.id, {
                                                    approved: true
                                                })
                                                setButtonClick(!buttonClick);
                                            }}
                                        />
                                    }
                                },
                                style: { color: '#35A265' }
                                /*
                                stringify: (k: ISubscriberList["approved"]) => {
                                    if (k) {
                                        return 'Approved'
                                    }
                                    else {

                                        return ''
                                    }
                                }
                                */
                            },
                            {
                                alias: "Since",
                                field: "start_date",
                                stringify: (k: ISubscriberList["start_date"]) => {
                                    return new Date(k).toLocaleDateString();
                                }
                            },
                            {
                                headerStyle: {
                                    flexGrow: 0,
                                    flexShrink: 0,
                                    flexBasis: '9%'

                                },
                                alias: ' ',
                                field: (item) => {
                                    return <DeleteButton
                                        onPress={async () => {
                                            await Api.Subscriber.extensions.removeSubscription({
                                                userId: item.item.user_id,
                                                subscriptionId: item.item.subscription_id
                                            })
                                            setButtonClick(!buttonClick);
                                        }}
                                        width={26}
                                        //height={'auto'}
                                        color={'#EC5328'}
                                    />
                                },
                                style: { marginLeft: -10 }
                            }
                        ]
                    }
                />

            </Tab>
        </TabView>
    </ElevatedSection>
    </View>
}

export const SubscriptionSettingsScreen = (props: RootStackScreenProps<"SubscriptionSettings">) => {


    return <View style={paddView}>
        <SubscriptionSettingsView navigation={props.navigation} />
    </View>
}

export const SubscriptionSettingsView = (props: { navigation?: NavigationProp<any>, submitRef?: React.MutableRefObject<{ submit: () => Promise<void> }> }) => {

    const call = Api.Subscription.extensions.getByUserId;
    const subscription = useReadonlyEntity<AwaitedReturn<typeof call>>(null)
    const toast = useToast();
    //const [approveSubs, setApproveSubs] = useState(subscription.data?.settings.approve_new === undefined ? false : subscription.data?.settings.approve_new);


    useEffect(() => {
        (async () => {
            try {
                subscription.resetData(await call());
            }
            catch (ex: any) {
                toast.show(ex.message)
            }
        })()
    }, [])

    const submit = async () => {
        if (subscription.data?.id) {
            await Api.Subscription.update(subscription.data.id, {
                cost: subscription?.data?.cost || 0,
                settings: subscription.data.settings
            })
        }
        else {
            await Api.Subscription.insert({
                name: "Basic Subscription",
                cost: subscription?.data?.cost || 0,
                settings: subscription?.data?.settings || false,
                user_id: ''
            })
        }
        props.navigation?.goBack();
    };
    if (props.submitRef)
        props.submitRef.current.submit = submit;

    return <ElevatedSection title="Subscription" style={{minWidth: '100%'}}>
        {/*<Text style={{ marginVertical: sizes.rem1 }}>
            Set a cost associated with subscribing to your account.
        </Text>
        <Picker
            style={{ marginBottom: sizes.rem1 }}
            value={subscription?.data?.cost || 0}
            onSelect={(item) => {
                subscription.update({
                    cost: item.row ? Math.pow(5, item.row) : 0
                })
            }}
            items={[...Array.from({ length: 1 }).map((v, i) => {
                const cost = i ? Math.pow(5, i) : 0;
                return {
                    label: cost ? `${cost}/month` : "Free",
                    value: cost
                }
            })]}
        />*/}
        <SwitchField label='Approve New Subscribers?'
            checked={subscription.data?.settings.approve_new}
            onChange={() => { subscription.update({ settings: { approve_new: !subscription.data?.settings.approve_new } }) }}
            viewStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 4, paddingVertical: 30 }}
            toggleStyle={{}}
            textStyle={{ fontSize: 16, fontWeight: '500', alignSelf: 'center' }} />
        {/* Codes will go here   */}
        {!props.submitRef?.current && <PrimaryButton disabled={!subscription.hasChanged} onPress={submit} >Apply</PrimaryButton>}
    </ElevatedSection>
}