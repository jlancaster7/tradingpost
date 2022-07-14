import React, { ReactElement } from "react";
import { Switch, SwitchProps, } from "react-native-ui-lib";

import { LabeledField } from "./LabeledField";
export type SwitchFieldProps = {
    compact?: boolean,
    label?: string,
    switchProps?: SwitchProps,
    leftElement?: (props: { width: number, height: number }) => ReactElement
}

export function SwitchField(props: SwitchFieldProps) {
    return <LabeledField
        compact={props.compact}
        label={props.label}
        leftElement={props.leftElement}
    ><Switch {...props.switchProps} /></LabeledField>
}

