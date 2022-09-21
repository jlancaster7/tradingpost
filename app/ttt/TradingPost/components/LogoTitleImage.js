"use strict";
exports.__esModule = true;
exports.LogoTitleImage = void 0;
var react_1 = require("react");
var react_native_ui_lib_1 = require("react-native-ui-lib");
var LogoImage_1 = require("./LogoImage");
var marginLeft = 8;
var marginTop = 8;
var marginBottom = 8;
function LogoTitleImage(props) {
    return <react_native_ui_lib_1.View style={{ flexDirection: "row", alignItems: "center", marginTop: marginTop, marginBottom: marginBottom }}>
        <LogoImage_1.LogoImage style={{ marginLeft: marginLeft }}/>
        <react_native_ui_lib_1.Text style={{ fontSize: 32, marginLeft: marginLeft }}>{props.title || "Amira Menu"}</react_native_ui_lib_1.Text>
    </react_native_ui_lib_1.View>;
}
exports.LogoTitleImage = LogoTitleImage;
