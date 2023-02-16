import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Input } from "@ui-kitten/components";
import { Button, Icon } from '@ui-kitten/components'
import { sizes } from "../style";
//TODO: clean this up ... this should be typed
export function KeyboardAvoidingInput(props: any) {
    return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{display: "flex", flexDirection: "column", alignContent: "flex-end"}}
        >
        <View style={{display: "flex", flexDirection: "row", alignItems: 'center'}}>
        <Input 
            placeholder={props.placeholder}
            value={props.value}
            multiline={true}
            numberOfLines={props.numLines}
            style={{flex: 1,
                    borderColor: '#ccc',
                    //paddingVertical: sizes.rem0_5, paddingLeft: sizes.rem0_5,
                    padding: sizes.rem0_5
                }}
            onChangeText={nextValue => props.setValue(nextValue)}
        />
        <Button 
            style={{backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    padding: sizes.rem0_5,
                    paddingLeft: 0,
                    display: props.displayButton ? 'flex' : 'none'}}
            onPress={() => {
                if (props.clicked) {
                    props.clicked[1](props.clicked[0] + 1)
                }
                props.onClick(props.value, props.setValue, props.item_id)
            }}            
            //onPress={props.onClick(props.value, props.setValue, props.item_id)}
            accessoryRight={props.rightIcon}
                        />

        </View>
    </KeyboardAvoidingView>);
}