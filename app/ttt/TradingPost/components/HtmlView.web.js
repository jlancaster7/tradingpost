"use strict";
exports.__esModule = true;
exports.HtmlView = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var HtmlView = function (props) {
    return <react_native_1.View style={props.style}><iframe 
    //marginwidth="0"
    //marginheight="0"
    //hspace="0"
    //vspace="0"
    //frameborder="0"
    name="_MYFIRAME" scrolling="no" src={props.isUrl ? props.children : undefined} srcDoc={!props.isUrl ? props.children : undefined} style={{ position: "absolute", top: 0, bottom: 0, height: "100%", width: "100%", borderWidth: 0 }}/>
    </react_native_1.View>;
};
exports.HtmlView = HtmlView;
