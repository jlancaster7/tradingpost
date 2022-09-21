"use strict";
exports.__esModule = true;
exports.IconifyIcon = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
function IconifyIcon(props) {
    var _a;
    (0, react_1.useEffect)(function () {
        if (props.DEBUG) {
            console.log(JSON.stringify(props.icon));
        }
    }, [props.icon, props.DEBUG]);
    var xml = "<svg fill=\"black\" ".concat(react_native_1.Platform.OS === "web" ? 'style="height:100%;width:100%;"' : "", " width=\"").concat(props.icon.width || 0, "\" height=\"").concat(props.icon.height || 0, "\" viewBox=\"0 0 ").concat(props.icon.width || 0, " ").concat(props.icon.height || 0, "\">").concat(props.currentColor ? props.icon.body.replace(/"currentColor"/gi, "\"".concat(props.currentColor, "\"")) : props.icon.body, "</svg>");
    var svg = react_native_1.Platform.OS === "web" ? <react_native_1.View style={(_a = props.svgProps) === null || _a === void 0 ? void 0 : _a.style}><div style={{ height: "100%", width: "100%" }} dangerouslySetInnerHTML={{ __html: xml }}/></react_native_1.View> :
        <react_native_svg_1.SvgXml height={"100%"} width={"100%"} xml={xml} {...props.svgProps}/>;
    return props.pressableProps ?
        <react_native_1.Pressable style={props.style} {...props.pressableProps}>{svg}</react_native_1.Pressable> :
        <react_native_1.View style={props.style}>{svg}</react_native_1.View>;
}
exports.IconifyIcon = IconifyIcon;
