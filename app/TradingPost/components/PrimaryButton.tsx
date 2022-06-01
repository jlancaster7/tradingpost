import React from 'react'
import { ButtonProps } from "react-native-ui-lib";
import Button from "react-native-ui-lib/button";
import { Colors } from 'react-native-ui-lib'


export function PrimaryButton(props: ButtonProps) {
    return <Button backgroundColor={Colors.primary} {...props} />
}


export function AltPrimaryButton(props: ButtonProps) {
    return <Button outline backgroundColor={Colors.white} color={Colors.primary} outlineColor={Colors.primary} {...props} />
}