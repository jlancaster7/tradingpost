import React, { useLayoutEffect, useState } from 'react'

//import { rnui } from '../images'
import { Text, Image } from 'react-native'
import { IndexPath, Select, SelectItem, SelectProps } from '@ui-kitten/components'

export type PickerProps<T extends boolean> = Omit<SelectProps, "children" | "mode" | "onSelect" | "value" | "migrate" | "spellCheck" | "selectedIndex"> & {
    selectionLimit?: number, multiSelect?: T,
    // selectedIndex?: (T extends false ? (IndexPath) : (IndexPath)[]),
    items: { label: string, value: string | number, iconUrl?: string }[],
    value?: T extends false ? (string | number) : (string | number)[]
    onSelect?: (item: (T extends false ? IndexPath : IndexPath[])) => void
}

export function Picker<T extends boolean = false>(props: PickerProps<T>) {

    //const [_value, setValues] = useState<PickerProps<T>["value"]>(props.value);

    // useLayoutEffect(() => {
    //     setValues();
    // }, [props.value])

    return <Select
        //rightIconSource={rnui.chevronDown}
        //spellCheck={false} 
        //migrate 
        //selectionLimit={props.selectionLimit}
        //multiSelect={props.multiSelect}
        //mode={props.multiSelect ? "MULTI" : "SINGLE"}
        {...props}
        //value={(p) => <Text {...p}></Text>}
        value={props.value instanceof Array ? props.items.map((item) => "TEST").filter(v => v).join(",") : props.items.find((v) => v.value === props.value)?.label || props.placeholder}

        onSelect={(v) => {
            // if (v instanceof Array) {
            //     setValues(v.map((v) => props.items[v.row].value) as any);
            // }
            // else {
            //     // console.log("TESTTTTT::::::" + props.items[v.row].value as any);
            //     setValues(props.items[v.row].value as any);
            // }

            if (props.onSelect)
                props.onSelect(v as any);
        }}
        selectedIndex={
            props.multiSelect ? props.items.map((i, idx) =>
                Boolean((props.value as any[]).find(_item => _item.value === i.value)) ?
                    new IndexPath(idx) : null).filter(v => v) as IndexPath[] :
                new IndexPath(props.items.findIndex((i, idx) => i.value === props.value))
        }>
        {props.items.map(i => <SelectItem accessoryLeft={(props) => <Image {...props} source={{ uri: i.iconUrl }} />} title={i.label} key={i.value} />)}
    </Select >
}