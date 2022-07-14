import React, { ReactElement, ReactNode, useLayoutEffect, useState } from "react";
import { Button, ButtonProps, Text } from "@ui-kitten/components";
import { flex, fonts, row, sizes } from "../style";
import { LabeledField } from "./LabeledField";
import { AltPrimaryButton, PrimaryButton } from "./PrimaryButton";
import { AltSecondaryButton, SecondaryButton } from "./SecondaryButton";
//import { PlaidLink, PlaidLinkComponentProps } from 'react-native-plaid-link-sdk'

export function ButtonField(props: {
    compact?: boolean, secondary?: boolean, label?: string, activeText?: string, disabledText?: string, inactiveText?: string, isActive?: boolean, leftElement?: (props: { width: number, height: number }) => ReactElement
}
    & Pick<ButtonProps, "onPress" | "disabled">) {
    const [_isActive, setIsActive] = useState(false)
    const buttonLabel =
        (props.disabled && props.disabledText) ?
            props.disabledText :
            (_isActive ?
                (props.activeText || "Active") :
                (props.inactiveText || "Inactive"))

    useLayoutEffect(() => {
        setIsActive(props.isActive || false)
    }, [props.isActive])
    const bProps: ButtonProps = {
        style:
        {
            width: sizes.rem9,
            height: sizes.rem2,
            padding: 0,

        },
        // labelStyle:
        // {
        //     height: sizes.rem1_5,
        //     top: 0
        // },
        children: buttonLabel,
        onPress(ev) {
            setIsActive((a) => props.isActive === undefined ? !a : props.isActive)
            if (props.onPress) {
                props.onPress(ev)
            }
        }
    };
    return <LabeledField compact={props.compact} label={props.label} leftElement={props.leftElement}>
        {_isActive ?
            (!props.secondary ? <PrimaryButton {...bProps} /> : <SecondaryButton {...bProps} />) :
            (!props.secondary ? <AltPrimaryButton {...bProps} /> : <AltSecondaryButton {...bProps} />)}
    </LabeledField>

}
export function PlaidButtonField(props: {
    plaidProps: {},// Omit<PlaidLinkComponentProps, "children">,
    compact?: boolean, secondary?: boolean, label?: string, activeText?: string, disabledText?: string, inactiveText?: string, isActive?: boolean, leftElement?: (props: { width: number, height: number }) => ReactElement
}
    & Pick<ButtonProps, "onPress" | "disabled">) {
    const [_isActive, setIsActive] = useState(false)
    const buttonLabel =
        (props.disabled && props.disabledText) ?
            props.disabledText :
            (_isActive ?
                (props.activeText || "Active") :
                (props.inactiveText || "Inactive"))

    useLayoutEffect(() => {
        setIsActive(props.isActive || false)
    }, [props.isActive])
    const bProps: ButtonProps = {
        style:
        {
            width: sizes.rem9,
            height: sizes.rem2,
            padding: 0,

        },
        // labelStyle:
        // {
        //     height: sizes.rem1_5,
        //     top: 0

        // },
        children: buttonLabel,
        onPress(ev) {
            setIsActive((a) => props.isActive === undefined ? !a : props.isActive)
            if (props.onPress) {
                props.onPress(ev)
            }
        }
    };
    return <LabeledField compact={props.compact} label={props.label} leftElement={props.leftElement}>
        <Text>BROKEN</Text>
        {
        /* <PlaidLink {...props.plaidProps}>
        <View pointerEvents="none">
            {_isActive ?
                (!props.secondary ? <PrimaryButton {...bProps} /> : <SecondaryButton {...bProps} />) :
                (!props.secondary ? <AltPrimaryButton {...bProps} /> : <AltSecondaryButton {...bProps} />)}
        </View>
    </PlaidLink> */}
    </LabeledField >

}



