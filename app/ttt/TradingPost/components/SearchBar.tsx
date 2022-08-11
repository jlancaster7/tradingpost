import { Icon, Input } from "@ui-kitten/components";
import React, { useRef } from "react";
import { ImageProps, ViewStyle, TextInputProps, Image, ViewProps, Pressable } from "react-native";
import { ITextField, TextField } from "../components/TextField";
import { navIcons } from "../images";

export const SearchBar = (props: { onTextChange: (text: string) => void } & Pick<ViewProps, "onLayout">) => {
    const tfRef = useRef<ITextField>(null)

    return <TextField
        textInputRef={tfRef}
        onLayout={props.onLayout}
        //enableErrors={false}
        //hideUnderline
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
        // style={{

        // } as ViewStyle} containerStyle={{
        //     marginBottom: 0,
        //     borderBottomColor: "#d5d5d5",
        //     borderBottomWidth: 1,
        //     paddingVertical: 16
        // } as ViewStyle}
        {
        ...{
            placeholder: "Search...",
            clearButtonMode: "while-editing",
            onChangeText: (text) => {
                props.onTextChange(text);
            }
        } as TextInputProps} />
}