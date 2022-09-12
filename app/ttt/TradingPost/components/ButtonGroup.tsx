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
                const isSelected = props.value === v.value;
                const opacity = isSelected ? 1 : 0.25;
                console.log(`Button at idx ${idx} isSelected: ${isSelected} with opacity of ${opacity}`);

                return <Button key={'button_' + idx + "_" + isSelected}
                    style={[
                        {
                            backgroundColor: isSelected ? "green" : "#777",
                            width: 100 / arr.length + "%",
                            opacity
                        }, isSelected ? props.unselectedStyle : undefined]
                    }
                    onPress={() => props.onValueChange(v.value)}>{v.label}</Button>
            })
        }
    </UI_ButtonGroup>

}


