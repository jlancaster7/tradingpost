import React, { ReactElement, useLayoutEffect, useState } from "react";
import { Button, ButtonProps, Text, View } from "react-native-ui-lib";
import { flex, fonts, row, sizes } from "../style";
import { AltPrimaryButton, PrimaryButton } from "./PrimaryButton";

export function LabeledField(props: { compact?: boolean, children?: ReactElement, label?: string, leftElement?: (props: { width: number, height: number }) => ReactElement }) {

    const sz = props.compact ? sizes.rem1 : sizes.rem2
    return <View style={[row, { alignItems: "center", marginBottom: sz }]}>
        {props.leftElement && props.leftElement({ height: sz, width: sz })}
        <Text style={[flex, { fontSize: props.compact ? fonts.small : fonts.medium }]}>{props.label}</Text>
        {props.children}
    </View>

}

