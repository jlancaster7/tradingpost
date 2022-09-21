"use strict";
exports.__esModule = true;
exports.SvgExpo = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var SvgExpo = function (props) {
    var url = props.children.type;
    var lastRef = (0, react_1.useRef)("");
    ;
    var onReadyRef = (0, react_1.useRef)(props.onReady);
    onReadyRef.current = props.onReady;
    var divRef = (0, react_1.useRef)(null);
    var _a = (0, react_1.useState)(""), svgData = _a[0], setSvgData = _a[1];
    (0, react_1.useEffect)(function () {
        lastRef.current = url;
        fetch(url, {}).then(function (data) {
            if (data.ok) {
                data.text().then(function (result) {
                    if (lastRef.current === url)
                        setSvgData(result);
                    // //hacky right now ... will fix later 
                    setTimeout(function () {
                        if (onReadyRef.current)
                            onReadyRef.current(divRef.current);
                    }, 222);
                });
            }
            else
                throw data.statusText;
        })["catch"](function (ex) { return console.log(ex); });
    }), [url];
    //hacky but gotta convert 
    return <react_native_1.View style={props.style}>
        <div ref={divRef} style={{ height: "100%", width: "100%", justifyContent: "center", alignContent: "center", alignItems: "center", display: "flex" }} dangerouslySetInnerHTML={{ __html: svgData }}/>
    </react_native_1.View>;
};
exports.SvgExpo = SvgExpo;
