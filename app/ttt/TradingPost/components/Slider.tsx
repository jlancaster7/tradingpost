import React from 'react';
import MultiSlider, { MultiSliderProps } from '@ptomasroos/react-native-multi-slider';

export function Slider(props: MultiSliderProps) {
    return <MultiSlider

        //thumbTintColor={Colors.primary}
        //maximumTrackTintColor={Colors.grey50}
        //minimumTrackTintColor={Colors.grey50} 
        {...props} />
}