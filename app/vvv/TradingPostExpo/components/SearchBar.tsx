import { Icon, Input } from "@ui-kitten/components";
import React, { useRef } from "react";
import { ImageProps, ViewStyle, TextInputProps, Image, ViewProps, Pressable, TextInputKeyPressEventData, NativeSyntheticEvent } from "react-native";
import { ITextField, TextField } from "../components/TextField";
import { navIcons } from "../images";

export const SearchBar = (props: { text: string, onTextChange: (text: string) => void, onEditingSubmit?: (e: string) => void, placeholder?: string } & Pick<ViewProps, "onLayout">) => {
    const tfRef = useRef<ITextField>(null)

    return <TextField
        textInputRef={tfRef}
        onLayout={props.onLayout}
        onSubmitEditing={(e) => {
            if (props.onEditingSubmit) props.onEditingSubmit(e.nativeEvent.text)
        }}
        accessoryLeft={
            () => {
                return <Image source={navIcons.Search.inactive} style={{
                    height: 20,
                    width: 20,
                    padding: 8,
                    marginHorizontal: 12,
                    transform: [
                        { scaleX: -1 }
                    ]
                }} />
            }
        }
        value={props.text}
        accessoryRight={
            () => {
                return <Pressable onPress={() => {
                    tfRef.current?.field.current?.clear();
                    props.onTextChange("");
                }}><Icon name="close-outline" style={{
                    height: 20,
                    width: 20,
                    padding: 8,
                    marginHorizontal: 12,
                    transform: [
                        { scaleX: -1 }
                    ]
                }} /></Pressable>
            }
        }
        {
        ...{
            placeholder: props.placeholder || "Search...",
            clearButtonMode: "while-editing",
            onChangeText: (text) => {
                props.onTextChange(text);
            }
        } as TextInputProps} />
}