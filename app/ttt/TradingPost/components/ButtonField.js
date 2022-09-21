"use strict";
exports.__esModule = true;
exports.PlaidButtonField = exports.ButtonField = void 0;
var react_1 = require("react");
var components_1 = require("@ui-kitten/components");
var style_1 = require("../style");
var LabeledField_1 = require("./LabeledField");
var PrimaryButton_1 = require("./PrimaryButton");
var SecondaryButton_1 = require("./SecondaryButton");
//import { PlaidLink, PlaidLinkComponentProps } from 'react-native-plaid-link-sdk'
function ButtonField(props) {
    var _a = (0, react_1.useState)(false), _isActive = _a[0], setIsActive = _a[1];
    var buttonLabel = (props.disabled && props.disabledText) ?
        props.disabledText :
        (_isActive ?
            (props.activeText || "Active") :
            (props.inactiveText || "Inactive"));
    (0, react_1.useLayoutEffect)(function () {
        setIsActive(props.isActive || false);
    }, [props.isActive]);
    var bProps = {
        style: {
            width: style_1.sizes.rem9,
            height: style_1.sizes.rem2,
            padding: 0
        },
        // labelStyle:
        // {
        //     height: sizes.rem1_5,
        //     top: 0
        // },
        children: buttonLabel,
        onPress: function (ev) {
            setIsActive(function (a) { return props.isActive === undefined ? !a : props.isActive; });
            if (props.onPress) {
                props.onPress(ev);
            }
        }
    };
    return <LabeledField_1.LabeledField compact={props.compact} label={props.label} leftElement={props.leftElement}>
        {_isActive ?
            (!props.secondary ? <PrimaryButton_1.PrimaryButton {...bProps}/> : <SecondaryButton_1.SecondaryButton {...bProps}/>) :
            (!props.secondary ? <PrimaryButton_1.AltPrimaryButton {...bProps}/> : <SecondaryButton_1.AltSecondaryButton {...bProps}/>)}
    </LabeledField_1.LabeledField>;
}
exports.ButtonField = ButtonField;
function PlaidButtonField(props) {
    var _a = (0, react_1.useState)(false), _isActive = _a[0], setIsActive = _a[1];
    var buttonLabel = (props.disabled && props.disabledText) ?
        props.disabledText :
        (_isActive ?
            (props.activeText || "Active") :
            (props.inactiveText || "Inactive"));
    (0, react_1.useLayoutEffect)(function () {
        setIsActive(props.isActive || false);
    }, [props.isActive]);
    var bProps = {
        style: {
            width: style_1.sizes.rem9,
            height: style_1.sizes.rem2,
            padding: 0
        },
        // labelStyle:
        // {
        //     height: sizes.rem1_5,
        //     top: 0
        // },
        children: buttonLabel,
        onPress: function (ev) {
            setIsActive(function (a) { return props.isActive === undefined ? !a : props.isActive; });
            if (props.onPress) {
                props.onPress(ev);
            }
        }
    };
    return <LabeledField_1.LabeledField compact={props.compact} label={props.label} leftElement={props.leftElement}>
        <components_1.Text>BROKEN</components_1.Text>
        {
        /* <PlaidLink {...props.plaidProps}>
        <View pointerEvents="none">
            {_isActive ?
                (!props.secondary ? <PrimaryButton {...bProps} /> : <SecondaryButton {...bProps} />) :
                (!props.secondary ? <AltPrimaryButton {...bProps} /> : <AltSecondaryButton {...bProps} />)}
        </View>
    </PlaidLink> */ }
    </LabeledField_1.LabeledField>;
}
exports.PlaidButtonField = PlaidButtonField;
