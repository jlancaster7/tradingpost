import React from 'react';
import { Colors, Slider as RNSlider, SliderProps } from 'react-native-ui-lib'

export function Slider(props: SliderProps) {
    return <RNSlider thumbTintColor={Colors.primary} 
    maximumTrackTintColor={ Colors.grey50}
    minimumTrackTintColor={ Colors.grey50}  {...props}/>
}