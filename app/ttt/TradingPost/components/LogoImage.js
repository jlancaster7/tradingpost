"use strict";
exports.__esModule = true;
exports.LogoImage = void 0;
var react_1 = require("react");
var images_1 = require("../images");
var size = {
    small: 48,
    medium: 128,
    large: 152,
    xLarge: 176,
    xxLarge: 256,
    mega: 320
};
function LogoImage(props) {
    var iconSize = size[props.size || "small"];
    return props.noBg ?
        <images_1.IconNoBg style={props.style} width={iconSize} height={iconSize}/>
        : <images_1.IconBg style={props.style} width={iconSize} height={iconSize}/>;
}
exports.LogoImage = LogoImage;
