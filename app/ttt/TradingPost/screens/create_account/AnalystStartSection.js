"use strict";
exports.__esModule = true;
exports.AnalystStartSection = void 0;
var components_1 = require("@ui-kitten/components");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var style_1 = require("../../style");
var analytics_svg_1 = require("../../assets/analytics.svg");
var SvgExpo_1 = require("../../components/SvgExpo");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Themed_1 = require("../../components/Themed");
var Section_1 = require("../../components/Section");
var native_1 = require("@react-navigation/native");
var AnalystStartSection = function (props) {
    var opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current, linkTo = (0, native_1.useLinkTo)();
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    return <ScrollWithButtons_1.ScrollWithButtons fillHeight buttons={{
            right: {
                text: "I'm An Analyst",
                onPress: function () {
                    linkTo("/create/analystinterest");
                }
            },
            left: {
                text: "Not Now",
                onPress: function () {
                    //need to change this to skip 2 
                    linkTo("/create/profilepicture");
                }
            }
        }}>
        <Themed_1.View style={[style_1.paddView, { justifyContent: "center" }]}>
            <Section_1.ElevatedSection title="">
                <react_native_1.Animated.View style={[{ opacity: opacityAnim }]}>
                    <components_1.Text style={[style_1.thinBannerText]}>Are you a Market Analyst?</components_1.Text>
                    <Themed_1.View style={{ padding: style_1.sizes.rem1 }}>
                        <SvgExpo_1.SvgExpo style={{ width: "100%", aspectRatio: 1.5 }}>
                            <analytics_svg_1["default"] />
                        </SvgExpo_1.SvgExpo>
                    </Themed_1.View>
                    <components_1.Text style={[style_1.thinBannerText, { fontSize: style_1.fonts.medium }]}>Select Analyst if you actively post fundamental or technical research related to stocks, commodities, crypto, etc. and would like to bolster your content.</components_1.Text>
                </react_native_1.Animated.View>
            </Section_1.ElevatedSection>
        </Themed_1.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
};
exports.AnalystStartSection = AnalystStartSection;
