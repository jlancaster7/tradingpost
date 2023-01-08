import React from 'react'
import {Image} from 'react-native'
import {IndexPath, Select, SelectItem, SelectProps} from '@ui-kitten/components'

export type PickerProps<T extends boolean> =
    Omit<SelectProps, "children" | "mode" | "onSelect" | "value" | "migrate" | "spellCheck" | "selectedIndex">
    & {
    selectionLimit?: number, multiSelect?: T,
    items: { label: string, value: string | number, iconUrl?: string }[],
    value?: T extends false ? (string | number) : (string | number)[]
    onSelect?: (item: (T extends false ? IndexPath : IndexPath[])) => void
}

export function Picker<T extends boolean = false>(props: PickerProps<T>) {
    return <Select
        {...props}
        value={props.value instanceof Array ? props.items.map((item) => "TEST").filter(v => v).join(",") : props.items.find((v) => v.value === props.value)?.label || props.placeholder}
        onSelect={(v) => {
            if (props.onSelect)
                props.onSelect(v as any);
        }}
        selectedIndex={
            props.multiSelect ? props.items.map((i, idx) =>
                    Boolean((props.value as any[]).find(_item => _item.value === i.value)) ?
                        new IndexPath(idx) : null).filter(v => v) as IndexPath[] :
                new IndexPath(props.items.findIndex((i, idx) => i.value === props.value))
        }>
        {props.items.map(i => <SelectItem accessoryLeft={(props) => <Image {...props} source={{uri: i.iconUrl}}/>}
                                          title={i.label} key={i.value}/>)}
    </Select>
}