import React, { useMemo, useRef, useState } from 'react'
//import { Alert } from 'react-native'
//import { ChipsInputProps } from 'react-native-ui-lib/generatedTypes/src/incubator'
import { Colors, Chip, ChipsInput, PickerProps, Text, View, TextField, ImageProps, ModalTopBarProps } from 'react-native-ui-lib'
import RN_Picker from 'react-native-ui-lib/picker'
import { rnui } from '../images'
import { } from 'react-native-ui-lib'
import { Label } from './Label'
import { SearchBar } from './SearchBar'


export type PickedChipType = { value: string, label: string, isSearch?: boolean };


export function ChipPicker(props: { hideUnderline?: boolean, maxSelectionCount?: number, customPicker?: () => JSX.Element, allowMannualEntry?: boolean, choices: PickedChipType[], placeholder?: string, label?: string, values?: PickedChipType[], defaultValues?: PickedChipType[], disabled?: boolean, onChange?: (value: PickedChipType, isRemoved?: boolean) => void }) {
    //const gfd = useRef<{ focus(): void }>(null);
    const { values, choices, allowMannualEntry, defaultValues } = props;
    const [internalValue, setInternalValue] = useState<PickedChipType[]>(defaultValues || []);
    const [searchValue, setSearchValue] = useState("");

    const searchItemFef = useRef<PickedChipType & { isSearch: boolean }>({
        label: "",
        value: "",
        isSearch: true
    });





    const items = useMemo(() => {
        const output = choices.map(c => ({ ...c, isSearch: false }))
        if (allowMannualEntry)
            output.push(searchItemFef.current)
        return output;

    }, [choices, allowMannualEntry]);//[{ label: "A", value: "A", isSearch: false }, { label: "B", value: "BAAA", isSearch: false }]
    const cleanValues = values || internalValue;

    searchItemFef.current.value = searchValue;

    const pp: PickerProps = {
        showSearch: true,
        //value: cleanValues.map(v => v.value),
        hideUnderline: props.hideUnderline,
        topBarProps: {
            title: props.label
        } as ModalTopBarProps,
        onChange: (ev) => {
            const str = ev as string;
            const val = str[0] === '�' ? {
                value: str,
                label: str.substring(1)
            } : items.find((kvp) => str === kvp.value)

            if (val) {
                if (!values)
                    setInternalValue(internalValue ? [...internalValue, val] : [val])

                setSearchValue("");

                if (props.onChange)
                    props.onChange(val);
            }
        },
        //Need to make a custom component
        renderCustomSearch() {
            //return <Text style={{borderBottomColor:"#d3d3d3", borderBottomWidth:1}}> LOL</Text>
            return <SearchBar onTextChange={setSearchValue} />
        }
    }

    // <RN_Picker.Item key={"________search_value"} label={`Select '${searchValue}'`} value={searchValue}
    //                     labelStyle={{ color: Colors.primary }}
    //                 />
    //multiDraftValue

    const pickerRef = useRef<RN_Picker>(null);

    return <View style={{ marginBottom: 15 }}>
        {props.label && <Label>{props.label}</Label>}
        <View style={{
            flexDirection: "row", flexWrap: "wrap",
            paddingBottom: 11,
            paddingTop: 6,
            borderBottomWidth: props.hideUnderline ? 0 : 1,
            borderColor: "#D2D6D8"
        }}>
            {cleanValues?.map((kvp) => <PickedChip manual={kvp.value[0] === '�'}   {...kvp} onRemove={({ value }) => {
                if (!values)
                    setInternalValue(internalValue.filter(kvp => kvp.value !== value));

                if (props.onChange)
                    props.onChange(kvp, true);

            }} />)}
            <RN_Picker
                ref={pickerRef}
                // mode={"MULTI"}
                migrate

                renderPicker={props.customPicker || (() => {
                    return props.disabled ? null : <Chip
                        label={props.placeholder}
                        rightIconSource={rnui.plus}
                    />
                })}
                {...pp}                
            >
                {items.filter(i => {
                    return i.isSearch ||
                        (!searchValue && cleanValues.find(v => v.value === i.value) ||
                            (searchValue.length >= 3 && (new RegExp(searchValue, 'i')).test(i.label)) ||
                            (searchValue.length && (new RegExp(searchValue, 'i')).test(i.value)))
                }).map((kvp) => {
                    return <RN_Picker.Item key={kvp.isSearch ? "________search_value" : kvp.value} label={kvp.isSearch ? `Select '${searchValue}'` : kvp.label} value={(kvp.isSearch ? "�" : "") + kvp.value}
                        labelStyle={kvp.isSearch ? { color: Colors.primary } : undefined}
                    // onPress={(ev) => {
                    //     console.log((pickerRef.current?.state as any).multiDraftValue)
                    // }}
                    />
                })}
                {/* There is a bug when this is conditional..... */}
                {/* {Boolean(searchValue) &&
                    <RN_Picker.Item key={"________search_value"} label={`Select '${searchValue}'`} value={searchValue}
                        labelStyle={{ color: Colors.primary }}
                    />} */}
            </RN_Picker>
        </View>
    </View >
}


function PickedChip(props: { label: string, value: string, onRemove: (chip: PickedChipType) => void, manual?: boolean }) {
    const [canRemove, setCanRemove] = useState(false);
    return <Chip
        key={props.value}
        label={props.label}
        dismissColor='black'
        backgroundColor={Colors.primary}
        containerStyle={{
            borderColor: Colors.primary
        }}
        labelStyle={{
            color: "white",
            fontStyle: props.manual ? "italic" : undefined
        }}

        dismissIconStyle={{ height: 10, width: 10 }}
        marginR-4
        marginB-8
        // style={{
        //marginBottom: 8,
        // marginRight: 8
        //}}
        onPress={() => {
            setCanRemove(r => !r);
        }}

        onDismiss={canRemove ? () => {
            props.onRemove({ label: props.label, value: props.value })
        } : undefined}

    />
}
