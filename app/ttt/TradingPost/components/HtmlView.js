"use strict";
exports.__esModule = true;
exports.HtmlView = void 0;
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var HtmlView = function (props) {
    return <react_native_webview_1.WebView style={props.style} source={props.isUrl ? { uri: props.children } : { html: props.children }}/>;
};
exports.HtmlView = HtmlView;
