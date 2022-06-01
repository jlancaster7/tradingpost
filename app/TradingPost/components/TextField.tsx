import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import RN_TextField from 'react-native-ui-lib/textField'
import { TextInputProps } from 'react-native-ui-lib/typings';

interface IRnField {
    focus(): void,
    validate: () => boolean
    clear(): void

}
export interface ITextField {
    field: RefObject<IRnField>,
    errorMessage?: string
}
export function TextField(props: {
    label: string,
    textInputRef?: MutableRefObject<ITextField | null>
    disabled?: boolean
    //defaulted this to false... which is the right way to to a positive assetion...  
    spellCheck?: boolean,
    //defaulted this to false... which is the right way to to a positive assetion...  
    autoCorrect?: boolean
} & Pick<TextInputProps, "disabledColor" | "errorMessage" | "enableErrors" | "validateOnChange" | "validate" | "value" | "error" | "containerStyle" | "style" | "onSubmitEditing" | "returnKeyType" | "placeholder" | "secureTextEntry" | "onChangeText" | "markRequired" | "numberOfLines">) {
    const rnuRef = useRef<IRnField>(null);
    if (props.textInputRef) {
        props.textInputRef.current = {
            errorMessage: props.errorMessage instanceof Array ? props.errorMessage.join(",") : props.errorMessage,
            field: rnuRef
        }
    }

    //const tt = { spellCheck: true, autoCorrect:false } as TextInputProps

    return <RN_TextField
        numberOfLines={props.numberOfLines}
        spellCheck={props.spellCheck || false}
        autoCorrect={props.autoCorrect || false}
        editable={!props.disabled}
        disabledColor={props.disabledColor || Colors.grey20}
        //placeholder="Enter Email..."
        validateOnChange={props.validateOnChange}
        validate={props.validate}
        errorMessage={props.errorMessage}
        value={props.value}
        markRequired={props.markRequired}
        ref={props.textInputRef?.current?.field}
        onSubmitEditing={props.onSubmitEditing}
        title={props.label}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secureTextEntry}
        returnKeyType={props.returnKeyType}
        placeholder={props.placeholder}
        error={props.error}
        style={props.style}
        hideUnderline={props.disabled}
        containerStyle={props.containerStyle}
    />
}
