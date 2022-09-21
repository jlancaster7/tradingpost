"use strict";
exports.__esModule = true;
exports.ProfileBanner = exports.useProfileBannerSize = exports.actionPanelSize = exports.profileImageSmall = exports.profileImageSize = void 0;
var react_native_1 = require("react-native");
var react_1 = require("react");
var react_native_2 = require("react-native");
var IconfiyIcon_1 = require("./IconfiyIcon");
var user_1 = require("@iconify/icons-mdi/user");
var style_1 = require("../style");
var react_native_3 = require("react-native");
var images_1 = require("../images");
var Colors_1 = require("../constants/Colors");
exports.profileImageSize = style_1.sizes.rem6;
exports.profileImageSmall = style_1.sizes.rem4;
exports.actionPanelSize = style_1.sizes.rem2;
var profileImageStyle = {
    height: exports.profileImageSize,
    width: exports.profileImageSize,
    position: "absolute",
    borderRadius: exports.profileImageSize / 2,
    backgroundColor: "darkgray",
    bottom: 0
};
var profileImageSmallStyle = {
    height: exports.profileImageSmall,
    width: exports.profileImageSmall,
    borderRadius: exports.profileImageSmall / 2,
    backgroundColor: "darkgray",
    position: "absolute",
    left: style_1.sizes.rem1,
    bottom: 0
};
function useProfileBannerSize() {
    var dim = (0, react_native_3.useWindowDimensions)();
    return dim.width / bannerAspectRatio + exports.actionPanelSize;
}
exports.useProfileBannerSize = useProfileBannerSize;
var bannerAspectRatio = 21 / 9; //16 / 9;
var viewStyle = {
    backgroundColor: "lightgray", aspectRatio: bannerAspectRatio, width: "100%", alignItems: "center", justifyContent: "flex-end"
};
function ProfileBanner(props) {
    var profilePic = props.profilePic, collapse = props.collapse;
    return <react_native_1.View style={{ alignItems: "center", width: "100%" }}>
        <react_native_1.Pressable key="imagepart" style={[viewStyle, { backgroundColor: Colors_1.AppColors.primary }, collapse ? { marginTop: exports.actionPanelSize / 2 + (props.extraMarginTop || 0) } : undefined]}>
            {/* <Image style={{ width: "100%", height: "100%", position: "absolute" }} source={ProfileBg} /> */}
            {
        /*</> :
        <View style={[row, { backgroundColor: "blue", width: "100%" }]}>
            <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} />
        </View>
        */
        }
        </react_native_1.Pressable>
        {!collapse && <react_native_1.View key="uncollapseFoot" style={[style_1.row, { width: "100%", alignSelf: "stretch", height: exports.actionPanelSize, backgroundColor: "white", alignContent: "center", alignItems: "center" }]}>
            <react_native_2.Text style={[style_1.flex, {
                    textAlign: "center", transform: [{
                            translateX: -exports.profileImageSize / 4
                        }],
                    maxWidth: '48%' // some weird ness here where the  social bar/ this container is weider than the screen so creating a horizontial scroll bar
                }]}>Subscribers {0}</react_native_2.Text>
            <react_native_1.View style={[style_1.row, style_1.flex, {
                    justifyContent: "center",
                    height: style_1.sizes.rem1_5,
                    maxWidth: '50%',
                    transform: [{
                            translateX: exports.profileImageSize / 4
                        }]
                }]}>
                <SocialBar claims={props.platforms}/>
            </react_native_1.View>
        </react_native_1.View>}
        {collapse && <react_native_1.View key="collapseFoot" style={[{ width: "100%", alignSelf: "stretch", height: exports.actionPanelSize, backgroundColor: "white", alignContent: "center", alignItems: "center" }]}>
            <react_native_1.View style={[style_1.row, { height: "100%", alignSelf: "flex-end", marginRight: style_1.sizes.rem1 }]}>
                <SocialBar claims={props.platforms}/>
            </react_native_1.View>
        </react_native_1.View>}
        <ProfilePic profilePic={profilePic} collapse={collapse} editMode={props.editMode} navigator={props.navigator} onProfilePicked={props.onProfilePicked}/>
    </react_native_1.View>;
}
exports.ProfileBanner = ProfileBanner;
var SocialBar = function (props) {
    //{social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo}
    return <>
        {["Twitter", "YouTube", "Spotify"].map(function (logoName, i) {
            //social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo
            //social.TwitterLogo, social.LinkedInLogo, social.YouTubeLogo
            var logo = images_1.social[logoName + "Logo"];
            return props.claims.find(function (c) { return c.toLowerCase() === logoName.toLowerCase(); }) ? <react_native_1.View style={{ height: "100%", aspectRatio: 1 }}>
                <IconfiyIcon_1.IconifyIcon key={"social_".concat(i)} icon={logo} svgProps={{ height: "75%" }} style={{ height: "75%", margin: "12.5%", aspectRatio: 1 }}/>
            </react_native_1.View> : undefined;
        })}
    </>;
};
function ProfilePic(props) {
    var profilePic = props.profilePic, collapse = props.collapse, editMode = props.editMode;
    var style = collapse ? profileImageSmallStyle : profileImageStyle;
    return <react_native_1.Pressable disabled={!editMode} style={style}>
        {profilePic ? <react_native_2.Image source={{ uri: profilePic }} style={[style, { left: 0 }]}/> :
            <IconfiyIcon_1.IconifyIcon style={{ height: "120%", width: "120%", left: "-10%" }} icon={user_1["default"]} currentColor='black'/>}
    </react_native_1.Pressable>;
}
