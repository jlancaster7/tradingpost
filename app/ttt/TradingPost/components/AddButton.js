"use strict";
exports.__esModule = true;
exports.FavButton = exports.EditButton = exports.AddButton = void 0;
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Colors_1 = require("../constants/Colors");
var AddButton = function (props) {
    return <react_native_1.Pressable onPress={props.onPress} style={{ justifyContent: "center" }}><components_1.Icon 
    //fill={AppColors.secondary}
    fill={Colors_1.AppColors.secondary} name="plus-square" style={{
            height: props.height,
            width: props.width
        }}/></react_native_1.Pressable>;
};
exports.AddButton = AddButton;
var EditButton = function (props) {
    return <react_native_1.Pressable onPress={props.onPress} style={[{ justifyContent: "center" }, props.style]}><components_1.Icon 
    //fill={AppColors.secondary}
    fill={"#708090"} name="edit-outline" style={{
            height: props.height,
            width: props.width
        }}/></react_native_1.Pressable>;
};
exports.EditButton = EditButton;
var FavButton = function (props) {
    return <react_native_1.Pressable onPress={props.onPress} style={{ justifyContent: "center" }}><components_1.Icon 
    //fill={AppColors.secondary}
    fill={props.isSelected ? "#F6BE00" : "#708090"} name={props.isSelected ? "star" : "star-outline"} style={{
            height: props.height,
            width: props.width
        }}/></react_native_1.Pressable>;
};
exports.FavButton = FavButton;
