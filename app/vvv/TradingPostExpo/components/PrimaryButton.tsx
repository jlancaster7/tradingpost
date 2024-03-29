import React from 'react'
//import { ButtonProps } from "react-native-ui-lib";
import { Button, ButtonProps } from '@ui-kitten/components'
import { AppColors } from '../constants/Colors'
import { sizes } from '../style'
//import Button from "react-native-ui-lib/button";

export function PrimaryButton(props: ButtonProps) {
    return <Button
        //backgroundColor={Colors.primary} 
        
        {...props} style={[{ borderRadius: 20 }, props.style]}  />
}

export function AltPrimaryButton(props: ButtonProps) {
    return <Button
        //backgroundColor={Colors.white} 
        //color={AppColors.primary}
        // outlineColor={AppColors.primary}
        {...props} />
}