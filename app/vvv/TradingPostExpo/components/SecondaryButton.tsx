import { Button, ButtonProps } from '@ui-kitten/components';
import React from 'react'
import { sizes } from '../style';
//import { ButtonProps } from "react-native";
//import Button from "react-native-ui-lib/button";
//import { Colors } from 'react-native-ui-lib'
import { PressableButton } from './PressableButton';


export function SecondaryButton(props: ButtonProps) {
    return <Button
        status={'success'} {...props} style={[{ borderRadius: 20}, props.style]} />
}
export function AltSecondaryButton(props: ButtonProps) {
    return <Button status={'success'} {...props} />
}