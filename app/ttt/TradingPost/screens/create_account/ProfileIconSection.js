"use strict";
exports.__esModule = true;
exports.ProfileIconSection = void 0;
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var style_1 = require("../../style");
var shared_1 = require("./shared");
var ProfileButton_1 = require("../../components/ProfileButton");
var Section_1 = require("../../components/Section");
var lds_1 = require("../../lds");
var native_1 = require("@react-navigation/native");
var ProfileIconSection = function (props) {
    var opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var _a = (0, lds_1.useData)("hasAuthed"), hasAuthed = _a.value, setValue = _a.setValue;
    var linkTo = (0, native_1.useLinkTo)();
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    return <ScrollWithButtons_1.ScrollWithButtons buttons={{
            right: {
                text: "Go To Trading Post!",
                onPress: function () {
                    setValue(true);
                    //props.navigation.navigate("Dash/portfolio");
                    linkTo('/dash/feed');
                }
            }
        }}>
        <react_native_1.Animated.View style={{ opacity: opacityAnim, padding: shared_1.sideMargin }}>
            <Section_1.ElevatedSection title="">
                <components_1.Text style={[style_1.thinBannerText]}>Tap to Modify Profile Picture</components_1.Text>
                <ProfileButton_1.ProfileButton userId={props.user.data.id} profileUrl="" size={style_1.sizes.rem16} editable/>
                <components_1.Text style={[style_1.thinBannerText]}>Tip: Profile pictures will help others quickly identify you when on the platform.</components_1.Text>
            </Section_1.ElevatedSection>
        </react_native_1.Animated.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
};
exports.ProfileIconSection = ProfileIconSection;
