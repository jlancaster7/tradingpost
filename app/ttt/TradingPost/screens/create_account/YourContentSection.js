"use strict";
exports.__esModule = true;
exports.YourContent = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var IconfiyIcon_1 = require("../../components/IconfiyIcon");
var Section_1 = require("../../components/Section");
var style_1 = require("../../style");
//import WebsiteLogo from '@iconify/icons-mdi/web'
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var images_1 = require("../../images");
//import { useIAM } from "../../apis/third-party/twitterApi"
var react_native_1 = require("react-native");
var hooks_1 = require("../../utils/hooks");
var twitter_1 = require("../../utils/third-party/twitter");
var native_1 = require("@react-navigation/native");
//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"
function YourContent(props) {
    var _a, _b;
    var _c;
    //const claims = useReadonlyEntity(props.user.data.claims),
    var AppearView = (0, hooks_1.useOpacityAnim)().AppearView;
    var twitterHandle;
    var setTwitterHandle;
    if (props.user.data.claims) {
        _a = (0, react_1.useState)((_c = props.user.data.claims.find(function (c) { return c.platform === "twitter"; })) === null || _c === void 0 ? void 0 : _c.platform_user_id), twitterHandle = _a[0], setTwitterHandle = _a[1];
    }
    else {
        _b = (0, react_1.useState)(''), twitterHandle = _b[0], setTwitterHandle = _b[1];
    }
    //useEffect(() => {
    //        if (props.saveOnly)
    //      setLockButtons(!broadcastEntity.hasChanged && !notificationEntity.hasChanged);
    //}, [props.saveOnly, broadcastEntity.hasChanged, notificationEntity.hasChanged]);
    var linkTo = (0, native_1.useLinkTo)();
    var getToken = (0, twitter_1.useTwitterAuth)();
    return <ScrollWithButtons_1.ScrollWithButtons fillHeight buttons={props.saveOnly ? undefined : {
            // left: {
            //     text: 'Not Now',
            //     onPress: props.next
            // },
            right: {
                text: 'Done With Accounts',
                onPress: function () { return linkTo('/create/profilepicture'); }
            }
        }}>
        <AppearView style={[style_1.paddView, { alignContent: "center" }]}>
            <Section_1.ElevatedSection title="Your Content">
                <components_1.Text style={style_1.thinBannerText}>TradingPost aggregates content across several social platforms.</components_1.Text>
                <react_native_1.View style={{ flexDirection: "row", marginHorizontal: style_1.sizes.rem2, marginBottom: style_1.sizes.rem1 }}>
                    <HandleButton title={twitterHandle} icon={images_1.social.TwitterLogo} onPress={function () {
            getToken().then(function (handle) {
                setTwitterHandle(handle);
            });
        }} iconPadd={style_1.sizes.rem1}/>
                    <HandleButton title="" icon={images_1.social.YouTubeLogo} iconPadd={style_1.sizes.rem1}/>
                </react_native_1.View>
                <react_native_1.View style={{ flexDirection: "row", marginHorizontal: style_1.sizes.rem2, marginBottom: style_1.sizes.rem1 }}>
                    <HandleButton title="" icon={images_1.social.SubstackLogo} iconPadd={style_1.sizes.rem1} currentColor={style_1.social.substackColor}/>
                    <HandleButton title="" icon={images_1.social.SpotifyLogo} iconPadd={style_1.sizes.rem0_5}/>
                </react_native_1.View>
                <components_1.Text style={style_1.thinBannerText}>Sign in to your account(s) above to claim or add your content.</components_1.Text>
            </Section_1.ElevatedSection>
            {/*
        <Section title={'Your Content'}>
            <ButtonField
                label='Twitter'
                inactiveText='Claim Handle'
                activeText='Claimed'
                //isActive={Boolean(props.user.data.claims.twitter)}
                onPress={async () => {
                    const username = "";
                    // const platform: Platform = {
                    //     platform: "twitter",
                    //     username
                    // }

                    try {
                        //const d = await iam();
                        //platform.username = d.username;//"levert_test_1";
                        //      //const result = await createPlatform(null, [platform]);
                        //                            console.log("RESULTS::" + JSON.stringify(result));
                    }
                    catch (ex) {
                        // if (ex instanceof AmiraError && ex.statusCode === 409) {
                        //     const respBody = (ex.body as { sub_status_code: number, message: string });
                        //     if (respBody.sub_status_code === 0) {
                        //         props.prompt("Husk Account Found", respBody.message,
                        //             [
                        //                 {
                        //                     text: "Cancel", onPress: (dialog) => {
                        //                         dialog.hideDialogView();
                        //                     }
                        //                 },
                        //                 {
                        //                     text: "Claim",
                        //                     onPress: async (dialog) => {
                        //                         try {
                        //                             await claimPlatform(null, [platform])
                        //                             dialog.hideDialogView();
                        //                         }
                        //                         catch (ex: any) {
                        //                             props.toastMessage(ex.message);
                        //                         }
                        //                     }
                        //                 }
                        //             ])
                        //     } else if (respBody.sub_status_code === 1) {
                        //         props.toastMessage(respBody.message);
                        //     }
                        //     else {
                        //         props.toastMessage("Something unexpected went wrong");
                        //     }
                        // }
                        // else
                        console.error(ex);
                    }
                }
                }
                leftElement={(props) => {
                    return <IconifyIcon icon={social.TwitterLogo} style={{ ...props, marginRight: sizes.rem1, }} />
                }}
            />
            <ButtonField
                label='YouTube'
                inactiveText='Claim Channel'
                activeText='Claimed'
                //                  isActive={Boolean(props.user.data.claims.youtube)}
                onPress={() => {
                    props.toastMessage("Invalid Fingerprint");
                }}
                leftElement={(props) => {
                    return <IconifyIcon icon={social.YouTubeLogo} style={{ ...props, marginRight: sizes.rem1 }} />
                }}
            />
            <ButtonField
                label='Substack'
                inactiveText='Claim Page'
                activeText='Claimed'
                //                isActive={Boolean(props.user.data.claims.substack)}
                onPress={TBI}
                leftElement={(props) => {
                    return <IconifyIcon icon={social.SubstackLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor={socialStyle.substackColor} />
                }}
            />
            // { <ButtonField
            //     label='LinkedIn'
            //     inactiveText='Claim Profile'
            //     activeText='Claimed'
            //     leftElement={(props) => {
            //         return <IconifyIcon icon={social.LinkedInLogo} style={{ ...props, marginRight: sizes.rem1 }} />
            //     }}
            // /> }
            // { <ButtonField
            //     label='Website'
            //     inactiveText='Claim Site'
            //     activeText='Claimed'
            //     leftElement={(props) => {
            //         return <IconifyIcon icon={WebsiteLogo} style={{ ...props, marginRight: sizes.rem1 }} currentColor='black' />
            //     }}
            /> }
        </Section> */}
        </AppearView>
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.YourContent = YourContent;
var HandleButton = function (props) {
    return <react_native_1.Pressable onPress={props.onPress} style={{ flex: 1, height: style_1.sizes.rem8, opacity: props.title ? 1 : 0.25 }}>
        <IconfiyIcon_1.IconifyIcon icon={props.icon} style={{ width: "100%", flex: 1, justifyContent: "space-around" }} svgProps={{ style: { paddingVertical: props.iconPadd, height: "100%" } }} currentColor={props.currentColor}/>
        <components_1.Text numberOfLines={1} style={{ fontStyle: !props.title ? "italic" : undefined, color: "black", textAlign: "center" }}>{props.title || "Unclaimed"}</components_1.Text>
    </react_native_1.Pressable>;
};
