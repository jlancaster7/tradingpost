import React from 'react'
import { ButtonProps } from "react-native-ui-lib";
import Button from "react-native-ui-lib/button";
import { Colors } from 'react-native-ui-lib'


export function SecondaryButton(props: ButtonProps) {
    return <Button  backgroundColor={Colors.secondary} color={Colors.white} {...props} />
}
export function AltSecondaryButton(props: ButtonProps) {
    return <Button outline backgroundColor={Colors.white} color={Colors.secondary} outlineColor={Colors.secondary} {...props} />
}