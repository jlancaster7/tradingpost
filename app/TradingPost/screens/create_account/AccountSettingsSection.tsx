import React, { useEffect, useState } from "react"
import { View } from "react-native-ui-lib"
import { ButtonField, PlaidButtonField } from "../../components/ButtonField"
import { IconifyIcon } from "../../components/IconfiyIcon"
import { Section, Subsection } from "../../components/Section"
import { SwitchField } from "../../components/SwitchField"
import { sizes } from "../../style"
import { CreateAccountProps, sideMargin, useChangeLock } from "../CreateAccountScreen"
import StripeLogo from '@iconify/icons-logos/stripe'
import CheckerLogo from '@iconify/icons-mdi/checkerboard'
//import { SetDashboardLayout } from "../../layouts/DashboardLayout"
//import { deleteAccount, UpdateUserProfile } from "../../apis/Authentication"
import { bindSwitch, useReadonlyEntity } from "../../utils/hooks"
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
//import { getPlaidLink, setPlaidToken } from "../../apis/PlaidApi"

export function AccountSettings(props: CreateAccountProps) {
    const [lockButtons, setLockButtons] = useChangeLock(props),
        broadcastEntity = useReadonlyEntity(/*props.user.data.settings?.broadcasting*/  {}),
        notificationEntity = useReadonlyEntity(/*props.user.data.settings?.notifications*/{}),
        [token, setToken] = useState<string>()


    useEffect(() => {
        if (props.saveOnly)
            setLockButtons(!broadcastEntity.hasChanged && !notificationEntity.hasChanged);
    }, [props.saveOnly, broadcastEntity.hasChanged, notificationEntity.hasChanged]);

    useEffect(() => {
        (async () => {
            //const plink = await getPlaidLink(null, { item_id: "", redirect_uri: "https://app.amirainvest.com/auth/plaid" });
            //console.log("TOKEN:" + plink.link_token);
            //setToken(plink.link_token);
        })()
     }, [])

    return <ScrollWithButtons buttons={{
        locked: lockButtons,
        left: props.saveOnly ? undefined : {
            text: 'Not Now',
            onPress: async () => {
                setLockButtons(true);
                try {
              //      await UpdateUserProfile({ status_setup: true });
                //    SetDashboardLayout();
                }
                catch (ex) {
                    setLockButtons(false);
                }
            }
        },
        right: {
            text: props.saveOnly ? 'Apply' : 'Finish',
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

                    notificationEntity.resetData(notificationEntity.data);
                    broadcastEntity.resetData(broadcastEntity.data);
                    // if (!props.saveOnly)
                    //     SetDashboardLayout();


                }
                catch (ex) {
                    setLockButtons(false);
                }
            }
        }
    }}>
        <View style={{ margin: sideMargin }}>
            <Section title='Push Notifications'>
                {/* <Subsection title='Posts'>
                    <SwitchField label='Mentions' compact switchProps={bindSwitch(notificationEntity, "posts_disableMentions", null, true)} />
                    <SwitchField label='Upvotes' compact switchProps={bindSwitch(notificationEntity, "posts_disableUpvotes", null, true)} />
                </Subsection>
                <Subsection title='Shared Watchlist'>
                    <SwitchField label='Price Movement' compact switchProps={bindSwitch(notificationEntity, "sharedWatchlist_disablePrice", null, true)} />
                    <SwitchField label='Changes' compact switchProps={bindSwitch(notificationEntity, "sharedWatchlist_disableChanges", null, true)} />
                </Subsection>
                <Subsection title='Watchlist'>
                    <SwitchField label='Price Movement' compact switchProps={bindSwitch(notificationEntity, "watchlist_disablePrice", null, true)} />
                </Subsection>
                <Subsection title='Email'>
                    <SwitchField label='Trade Alerts' compact switchProps={bindSwitch(notificationEntity, "email_tradeAlerts", null, true)} />
                </Subsection> */}
            </Section>
            <Section title='Broadcasting'>
                <Subsection title='Accounts'>
                    {token && <PlaidButtonField
                        plaidProps={{
                            tokenConfig: {
                                token,
                                noLoadingState: true
                            },
                            // onSuccess: async (p) => {
                            //     //console.log(JSON.stringify(p))
                            //     try {
                            //         // await setPlaidToken(null, {
                            //         //     public_token: p.publicToken,
                            //         //     is_update: false
                            //         // });
                            //     }
                            //     catch (ex: any) {
                            //         props.toastMessage(ex.message);
                            //     }
                            // }
                        }}
                        inactiveText="Manage"
                        leftElement={(props) => {
                            return <IconifyIcon icon={CheckerLogo} style={{ height: sizes.rem2, width: sizes.rem2, marginRight: sizes.rem1 / 2 }} currentColor='black'
                            />
                        }} label='Brokerage Account'

                        compact />}
                    <ButtonField leftElement={(props) => {
                        return <IconifyIcon icon={StripeLogo} style={{ height: sizes.rem2, width: sizes.rem2, marginRight: sizes.rem1 / 2 }} />
                    }} label='Stripe Account' compact />
                </Subsection>
                <Subsection title='Display'>
                    {/* <SwitchField label='Performance' compact switchProps={bindSwitch(broadcastEntity, "enableHoldings", null, true)} />
                    <SwitchField label='Portfolio' compact switchProps={bindSwitch(broadcastEntity, "disableProfile", null, true)} />
                <SwitchField label='Trades' compact switchProps={bindSwitch(broadcastEntity, "enableTrades", null, true)} /> */}
                </Subsection>
                <Section title='Management'>
                    <ButtonField
                        onPress={async () => {
                            try {
                                //await deleteAccount();
                            } catch (ex: any) {
                                props.toastMessage(ex.message);
                            }
                        }}
                        label='DELETE ACCOUNT'
                        isActive
                        secondary
                        activeText="FOREVER"
                    />
                </Section>
            </Section>
        </View>
    </ScrollWithButtons>
}