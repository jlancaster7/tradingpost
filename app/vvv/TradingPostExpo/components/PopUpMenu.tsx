import {StyleSheet, Text, View} from "react-native";
import {
    Menu,
    MenuProvider,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from "react-native-popup-menu";
import React from "react";

export default function PopUpMenu(props: { trigger: React.ReactElement }) {
    return <Menu>
        <MenuTrigger>
            {props.trigger}
        </MenuTrigger>
        <MenuOptions>
            <MenuOption onSelect={() => alert(`Save`)} text="Save"/>
            <MenuOption onSelect={() => alert(`Delete`)} text="Delete"/>
        </MenuOptions>
    </Menu>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        flexDirection: "column",
    },
});