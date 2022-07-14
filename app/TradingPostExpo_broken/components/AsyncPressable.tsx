import React, { ReactNode, useState } from "react";
import { Pressable } from "react-native";

export const AsyncPressable = (props: { children: ReactNode, onPress?: () => Promise<void> }) => {
    const [isDisabled, setIsDisabled] = useState(false);
    const { onPress, children } = props;
    return <Pressable disabled={isDisabled} onPress={async () => {
        setIsDisabled(true);

        if (onPress)
            await onPress();

        setIsDisabled(false);

    }}>{children}</Pressable>
}