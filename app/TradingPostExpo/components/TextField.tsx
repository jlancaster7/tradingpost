import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import { ViewStyle, TextInputProps } from 'react-native';
//import { Colors } from 'react-native-ui-lib';
import { Text, Input, InputProps } from '@ui-kitten/components'


// interface IRnField {
//     focus(): void,
//     clear(): void
// }
export interface ITextField {
    field: RefObject<Input>,
    errorMessage?: string
    validate: () => boolean
}
export function TextField(props: {
    label?: string,
    textInputRef?: MutableRefObject<ITextField | null>
    disabled?: boolean
    validate?: (value: string | undefined) => boolean,
    validateOnChange?: boolean
    errorMessage?: string,
    //defaulted this to false... which is the right way to to a positive assetion...  
    spellCheck?: boolean,
    //defaulted this to false... which is the right way to to a positive assetion...  
    autoCorrect?: boolean,
    //caption?: InputProps["caption"],

} & TextInputProps & Pick<InputProps, "caption" | "accessoryLeft">) {
    const rnuRef = useRef<Input>(null);
    const [caption, setCaption] = useState<InputProps["caption"]>();
    const [valueTracker, setValueTracker] = useState<string>();

    useEffect(() => {
        setCaption(props.caption);
    }, [props.caption])
    useEffect(() => {
        setValueTracker(props.value);
    }, [props.value])
    const { validate } = props;
    if (props.textInputRef) {
        props.textInputRef.current = {
            errorMessage: /* props.errorMessage instanceof Array ? props.errorMessage.join(",") :*/ props.errorMessage,
            validate: () => validate ? validate(valueTracker) : true,
            field: rnuRef
        }
    }

    //const tt = { spellCheck: true, autoCorrect:false } as TextInputProps

    return <Input

        numberOfLines={props.numberOfLines}
        spellCheck={props.spellCheck || false}
        autoCorrect={props.autoCorrect || false}
        editable={!props.disabled}
        //disabledColor={props.disabledColor || Colors.grey20}
        //placeholder="Enter Email..."
        //validateOnChange={props.validateOnChange}
        caption={caption}
        accessoryLeft={props.accessoryLeft}
        //validate={props.validate}
        //errorMessage={props.errorMessage}
        value={props.value}
        //markRequired={props.markRequired}
        //ref={props.textInputRef?.current?.field}
        onSubmitEditing={props.onSubmitEditing}
        label={props.label}
        onChangeText={(t) => {
            setValueTracker(t);
            if (validate && props.validateOnChange) {
                let errorMessage: string | undefined = undefined;
                let newCaption: InputProps["caption"] = undefined;
                if (!validate(t)) {
                    errorMessage = props.errorMessage;
                    newCaption = () => <Text category={"c1"} style={{ color: "red" }}>{errorMessage}</Text>;
                }

                if (props.textInputRef?.current) {
                    props.textInputRef.current.errorMessage = errorMessage;
                    //props.textInputRef.current.validate = () => validate(t);
                }
                setCaption(() => newCaption);
            }

            if (props.onChangeText)
                props.onChangeText(t);
        }}
        secureTextEntry={props.secureTextEntry}
        returnKeyType={props.returnKeyType}
        placeholder={props.placeholder}
        //error={props.error}
        style={props.style}
    //hideUnderline={props.disabled}
    //containerStyle={props.containerStyle}
    />
}
