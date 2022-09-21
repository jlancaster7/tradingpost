"use strict";
exports.__esModule = true;
exports.SearchBar = void 0;
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var TextField_1 = require("../components/TextField");
var images_1 = require("../images");
var SearchBar = function (props) {
    var tfRef = (0, react_1.useRef)(null);
    return <TextField_1.TextField textInputRef={tfRef} onLayout={props.onLayout} 
    //enableErrors={false}
    //hideUnderline
    accessoryLeft={function () {
            return <react_native_1.Image source={images_1.navIcons.Search.inactive} style={{
                    height: 20,
                    width: 20,
                    padding: 8,
                    marginHorizontal: 12,
                    transform: [
                        { scaleX: -1 }
                    ]
                }}/>;
        }} accessoryRight={function () {
            return <react_native_1.Pressable onPress={function () {
                    var _a, _b;
                    (_b = (_a = tfRef.current) === null || _a === void 0 ? void 0 : _a.field.current) === null || _b === void 0 ? void 0 : _b.clear();
                    props.onTextChange("");
                }}><components_1.Icon name="close-outline" style={{
                    height: 20,
                    width: 20,
                    padding: 8,
                    marginHorizontal: 12,
                    transform: [
                        { scaleX: -1 }
                    ]
                }}/></react_native_1.Pressable>;
        }} 
    // style={{
    // } as ViewStyle} containerStyle={{
    //     marginBottom: 0,
    //     borderBottomColor: "#d5d5d5",
    //     borderBottomWidth: 1,
    //     paddingVertical: 16
    // } as ViewStyle}
    {...{
        placeholder: "Search...",
        clearButtonMode: "while-editing",
        onChangeText: function (text) {
            props.onTextChange(text);
        }
    }}/>;
};
exports.SearchBar = SearchBar;
