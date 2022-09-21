"use strict";
exports.__esModule = true;
exports.ProfileBar = void 0;
var native_1 = require("@react-navigation/native");
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var ProfileButton_1 = require("./ProfileButton");
var ProfileBar = function (props) {
    var _a, _b, _c, _d;
    var nav = (0, native_1.useNavigation)();
    var openProfile = function () {
        var _a;
        if ((_a = props.user) === null || _a === void 0 ? void 0 : _a.id) {
            nav.navigate("Profile", {
                userId: props.user.id
            });
        }
    };
    return <react_native_1.View style={props.style}><react_native_1.View style={{ flexDirection: "row", width: "100%", marginBottom: style_1.sizes.rem0_5 }}>
        <ProfileButton_1.ProfileButton userId={((_a = props.user) === null || _a === void 0 ? void 0 : _a.id) || ""} profileUrl={((_b = props.user) === null || _b === void 0 ? void 0 : _b.profile_url) || ""} size={style_1.sizes.rem2}/>
        <react_native_1.View style={[style_1.flex, { marginLeft: style_1.sizes.rem0_5 }]}>
            <react_native_1.Pressable onPress={openProfile}><components_1.Text category={"s1"}>{(_c = props.user) === null || _c === void 0 ? void 0 : _c.display_name}</components_1.Text></react_native_1.Pressable>
            <react_native_1.Pressable onPress={openProfile}><components_1.Text category={"s2"}>{"@" + ((_d = props.user) === null || _d === void 0 ? void 0 : _d.handle)}</components_1.Text></react_native_1.Pressable>
        </react_native_1.View>
    </react_native_1.View>
    </react_native_1.View>;
};
exports.ProfileBar = ProfileBar;
