import React, { useState } from 'react'
import { PickerItemValue, PickerProps as RNU_PickerProps } from 'react-native-ui-lib'
import { rnui } from '../images'
import RNU_Picker from 'react-native-ui-lib/picker'
import { PickerItemLabeledValue } from 'react-native-ui-lib/typings';

export type PickerProps<T extends boolean> = Omit<RNU_PickerProps, "children" | "mode" | "value" | "onChange" | "migrate" | "spellCheck"> & {
    selectionLimit?: number, multiSelect?: T,
    value?: (T extends false ? (string | number) : (string | number)[]),
    items: { label: string, value: string | number }[],
    onChange?: (item: (T extends false ? (string | number) : (string | number)[])) => void
}

export function Picker<T extends boolean = false>(props: PickerProps<T>) {

    const [_value, setValues] = useState(props.multiSelect ? [] as any[] : undefined);
    return <RNU_Picker
        rightIconSource={rnui.chevronDown}
        spellCheck={false} migrate selectionLimit={props.selectionLimit} mode={props.multiSelect ? "MULTI" : "SINGLE"}
        {...props}
        onChange={(v: any) => {
            setValues(v);
            if (props.onChange)
                props.onChange(v);
        }}
        value={props.value || _value}>
        {props.items.map(i => <RNU_Picker.Item {...i} key={i.value} />)}
    </RNU_Picker>
}