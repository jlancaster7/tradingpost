import { NavigationProp } from "@react-navigation/native";
import { Api } from "@tradingpost/common/api";
import { ISubscriberList } from "@tradingpost/common/api/entities/interfaces";
import { Text, Tab, TabView, Avatar } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { EditButton } from "../components/AddButton";
import { Picker } from "../components/Picker";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProfileButton } from "../components/ProfileButton";
import { ElevatedSection } from "../components/Section";
import { Table } from "../components/Table";
import { TextField } from "../components/TextField";
import { TabScreenProps } from "../navigation";
import { paddView, sizes } from "../style";
import { useReadonlyEntity } from "../utils/hooks";
import { AwaitedReturn } from "../utils/misc";

export const SubscriptionScreen = (props: TabScreenProps) => {
    const [index, setIndex] = useState(0);
    //const [] = useState<  >()
    //  useEffect(()=>{},[])
    const mySubscriptionsCall = Api.Subscriber.extensions.getBySubscriber,
        mySubscribersCall = Api.Subscriber.extensions.getByOwner,
        [subscriptions, setSubscriptions] = useState<AwaitedReturn<typeof mySubscriptionsCall>>(),
        [subscribers, setSubscribers] = useState<AwaitedReturn<typeof mySubscribersCall>>()

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

    return <View style={paddView}><ElevatedSection title="Manage Subscriptions"
        button={(p) => <EditButton onPress={() => {
            props.navigation.navigate("SubscriptionSettings");
        }} {...p} />}
    ><TabView
        indicatorStyle={{
            marginTop: 26
        }} style={{ marginVertical: sizes.rem0_5 }} selectedIndex={index} onSelect={setIndex}>
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
                            {
                                alias: "Cost",
                                align: "left",
                                field: "subscription",
                                stringify: (k: ISubscriberList["subscription"]) => {
                                    return String(k[0].cost)
                                }
                            },
                            {
                                alias: "Since",
                                field: "start_date",
                                stringify: (k: ISubscriberList["start_date"]) => {
                                    return String(k);
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
                                alias: "Since",
                                field: "start_date",
                                stringify: (k: ISubscriberList["start_date"]) => {
                                    return String(k);
                                }
                            }
                        ]
                    }
                />

            </Tab>
        </TabView>
    </ElevatedSection>
    </View>
}

export const SubscriptionSettingsScreen = (props: TabScreenProps) => {


    return <View style={paddView}>
        <SubscriptionSettingsView navigation={props.navigation} />
    </View>
}

export const SubscriptionSettingsView = (props: { navigation?: NavigationProp<any>, submitRef?: React.MutableRefObject<{ submit: () => Promise<void> }> }) => {

    const call = Api.Subscription.extensions.getByUserId;
    const subscription = useReadonlyEntity<AwaitedReturn<typeof call>>(null)
    const toast = useToast();


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
                cost: subscription?.data?.cost || 0
            })
        }
        else {
            await Api.Subscription.insert({
                name: "Basic Subscription",
                cost: subscription?.data?.cost || 0,
                user_id: ''
            })
        }
        props.navigation?.goBack();
    };
    if (props.submitRef)
        props.submitRef.current.submit = submit;

    return <ElevatedSection title="Primary Subscription">
        <Text style={{ marginVertical: sizes.rem1 }}>
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
            items={[...Array.from({ length: 10 }).map((v, i) => {
                const cost = i ? Math.pow(5, i) : 0;
                return {
                    label: cost ? `${cost}/month` : "Free",
                    value: cost
                }
            })]}
        />
        {/* Codes will go here   */}
        {!props.submitRef?.current && <PrimaryButton disabled={!subscription.hasChanged} onPress={submit} >Apply</PrimaryButton>}
    </ElevatedSection>
}