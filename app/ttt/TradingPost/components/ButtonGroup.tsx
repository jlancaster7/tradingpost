import { Button, ButtonGroup as UI_ButtonGroup, ButtonGroupProps, ButtonProps } from "@ui-kitten/components"
import React, { useState } from "react"
import { sizes } from "../style"

export const ButtonGroup = <T extends string>(props: {
    value: T | undefined,
    onValueChange: (value: T) => void
    items: { label: string, value: T }[],
    unselectedStyle?: ButtonProps["style"],
    style?: ButtonGroupProps["style"]
}) => {
    return <UI_ButtonGroup style={[{ width: "100%", marginBottom: sizes.rem1 }, props.style]}>
        {
            props.items.map((v, idx, arr) => {
                return <Button key={'button_' + idx} style={props.value === v.value ? { backgroundColor: "green", width: 100 / arr.length + "%" } : [{
                    backgroundColor: '#777'// "lightgray"
                    , opacity: 0.25, width: 100 / arr.length + "%"
                }, props.unselectedStyle]} onPress={() => props.onValueChange(v.value)}>{v.label}</Button>
            })
        }
        {/* <Button style={type === "public" ? { backgroundColor: "green", width: "50%" } : { backgroundColor: "lightgray", opacity: 0.25, width: "50%" }} onPress={() => setWatchlistType("public")}>Public</Button>
        <Button style={type === "private" ? { backgroundColor: "green", width: "50%" } : { backgroundColor: "lightgray", opacity: 0.25, width: "50%" }} onPress={() => setWatchlistType("private")}>Private</Button> */}
    </UI_ButtonGroup>

}


