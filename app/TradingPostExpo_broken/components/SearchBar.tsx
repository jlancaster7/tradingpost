import React from "react";
import { ImageProps, ViewStyle, TextInputProps } from "react-native";
import { TextField, ViewProps } from "react-native-ui-lib";
import { navIcons } from "../images";

export const SearchBar = (props: { onTextChange: (text: string) => void } & Pick<ViewProps, "onLayout">) => {
    return <TextField
        onLayout={props.onLayout}
        enableErrors={false}
        hideUnderline
        leadingIcon={
            {
                source: navIcons.Search.inactive,
                style: {
                    height: 20,
                    width: 20,
                    padding: 8,
                    marginHorizontal: 12,
                    transform: [
                        { scaleX: -1 }
                    ]
                }
            } as ImageProps
        }
        style={{

        } as ViewStyle} containerStyle={{
            marginBottom: 0,
            borderBottomColor: "#d5d5d5",
            borderBottomWidth: 1,
            paddingVertical: 16
        } as ViewStyle} {

        ...{
            placeholder: "Search...",
            clearButtonMode: "while-editing",
            onChangeText: (text) => {
                props.onTextChange(text);
            }
        } as TextInputProps} />
}