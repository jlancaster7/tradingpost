import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Input } from "@ui-kitten/components";
import { CommentIcon } from "../images";
import { Button, Icon } from '@ui-kitten/components'
import { sizes } from "../style";

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

            style={{flex: 1, paddingVertical: sizes.rem0_5, paddingLeft: sizes.rem0_5}}
            onChangeText={nextValue => props.setValue(nextValue)}
        />
        <Button 
            style={{backgroundColor: 'transparent',
                    borderColor: 'transparent'}}
            onPress={() => {
                props.clicked[1](props.clicked[0] + 1)
                props.onClick(props.value, props.setValue, props.item_id)
            }}            
            //onPress={props.onClick(props.value, props.setValue, props.item_id)}
            accessoryRight={props.rightIcon}
                        />
        
        </View>
    </KeyboardAvoidingView>);
}