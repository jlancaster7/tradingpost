import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Pressable, View, ViewStyle, Text, TextStyle } from "react-native";
import { useSecuritiesList } from '../SecurityList'
import { SearchBar } from "./SearchBar";
import { Interface } from "@tradingpost/common/api"
import { ISecurityList } from "@tradingpost/common/api/entities/interfaces";
import { Avatar, Icon } from "@ui-kitten/components";
import { List } from "./List";
import { companyProfileContentSizes, companyProfileStyle, flex, sizes } from "../style";
import { KeyboardAvoidingInput } from "./KeyboardAvoidingInput";
import { useIsKeyboardVisible } from "../utils/hooks";
import { ElevatedSection } from "./Section";
import { FontWeight } from "react-native-svg";


const numItemsPerRow = 3;
//TODO: Need to optimize security load
const empty = {};
type SecOrEmpty = ISecurityList | {};

export type SelectionConverterRef = MutableRefObject<((selectedItems: Record<number, true>) => ISecurityList[]) | null>;
//helper until i  lean this up
export const useWatchlistPicker = () => {
    const [selectedItems, setSelectedItems] = useState<Record<number, true>>({})
    return {
        selectionConverter: useRef<(selectedItems: Record<number, true>) => ISecurityList[]>(null),
        selectedItems,
        onSelectedItemschanged: setSelectedItems,
        symbolConverter: useRef<(symbols: string[]) => Record<number, true>>(null),
    }
}
export const WatchlistPicker = (props: { selectedItems: Record<number, true>, securitiesLoaded?: () => void, onSelectedItemschanged: (selectedItems: Record<number, true>) => void, selectionConverter: SelectionConverterRef, symbolConverter: MutableRefObject<((symbols: string[]) => Record<number, true>) | null> }) => {

    const [searchText, setSearchText] = useState(""),
        { selectedItems } = props,
        [data, setData] = useState<(Interface.ISecurityList | {})[]>([]),
        [datasetKey, setDatasetKey] = useState("")
    let { securities: {
            list: securities
        } } = useSecuritiesList()

    //    if (props.selectionConverter) {


    //This is a all part of just getting done quickly.. need ot clean this up 
    useEffect(() => {
        if (securities.length && props.securitiesLoaded) {
            securities = securities.filter(a => a.symbol !== 'GOOGL')
            props.securitiesLoaded()
        }

    }, [securities.length, Boolean(props.securitiesLoaded)])
    props.selectionConverter.current = securities.length ? (_selectedItems) => securities.filter((s) => _selectedItems[s.id]) : null;
    props.symbolConverter.current = securities.length ? (_symbols) => {
        const output: Record<number, true> = {}
        securities.forEach((s) => {
            if (_symbols.find((_s) => _s === s.symbol))
                output[s.id] = true;
        })
        return output;
    } : null
    //}
    //  else if (props.selectionConverter)
    const delayRef = useRef(0);

    const selectedItemCount = Object.keys(selectedItems).length;
    useEffect(() => {
        if (delayRef.current)
            clearTimeout(delayRef.current);

        delayRef.current = setTimeout(() => {

            const items: (ISecurityList | {})[] = securities.filter((s, i) =>
                (!searchText && (i < 15 || selectedItems[s.id])) ||
                ((searchText.length >= 3 && new RegExp(searchText, "gi").test(s.security_name))) ||
                (searchText.length && (new RegExp(searchText, "gi")).test(s.symbol))
            ).sort((a, b) => {
                if (selectedItems[a.id] && !selectedItems[b.id])
                    return -1
                else if (selectedItems[b.id] && !selectedItems[a.id])
                    return 1
                else {
                    return (() => {

                        if (searchText) {
                            if (searchText.length <= 3) {
                                const aStartsWith = new RegExp("^" + searchText, "gi").test(a.symbol);
                                const bStartsWith = new RegExp("^" + searchText, "gi").test(b.symbol);

                                if (aStartsWith && !bStartsWith)
                                    return -1
                                else if (!aStartsWith && bStartsWith)
                                    return 1
                                else
                                    return a.symbol.localeCompare(b.symbol)
                            }
                            else
                                return a.symbol.localeCompare(b.symbol)
                        }
                        else
                            return 0
                    })()
                }
                //? a.symbol.localeCompare(b.symbol) : 
                //                (selectedItems[a.id] ? -1 : -1)
            });

            const gap = Array.from({ length: numItemsPerRow - (items.length % numItemsPerRow) }, () => empty);
            if (gap.length !== 4)
                items.push(...gap);
            // @ts-ignore
            setData(items.filter(a => a.symbol !== 'GOOGL'))
            setDatasetKey(searchText);
        }, 333) as any;
    }, [searchText, securities, selectedItems])



    return <View
        style={[flex]}
    >
        <View style={{ marginBottom: sizes.rem1 }}>
            <KeyboardAvoidingInput
                value={searchText}
                displayButton={false}
                numLines={1}
                placeholder={'Searching...'}
                setValue={setSearchText}
            />
        </View>
        <View style={flex}>
            <List
                numColumns={numItemsPerRow}
                data={data}
                datasetKey={datasetKey ? datasetKey : data.filter(d => d !== empty).length}
                renderItem={(i) => {
                    return <SecurityCell
                        item={i.item}
                        isSelected={isSec(i.item) ? (selectedItems[i.item.id] || false) : false}
                        onPressed={(isSelected) => {
                            if (isSec(i.item)) {
                                const selectedClone = { ...selectedItems };
                                if (isSelected)
                                    selectedClone[i.item.id] = true;
                                else
                                    delete selectedClone[i.item.id];
                                props.onSelectedItemschanged(selectedClone)
                                //setSelectedItems(selectedClone);
                                return true
                            }
                            return false;
                        }} />

                }}
                loadingItem={undefined} />
        </View>
    </View >
}


const isSec = (item: SecOrEmpty): item is ISecurityList => {
    return item !== empty;
}
//padding: 0, borderRadius: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
const cellStyle = { flexGrow: 1, zjustifyContent: "center", marginVertical: 0, alignItems: "center", flexBasis: 20 } as ViewStyle;
const SecurityCell = (props: { item: ISecurityList | {}, isSelected: boolean, onPressed: (isSelected: boolean) => boolean }) => {
    const { item, onPressed, isSelected } = props;
    const [innerSelected, setInnerSelected] = useState(isSelected)

    return <Pressable
                onPress={() => {
                    if (onPressed(!innerSelected)) {
                        setInnerSelected(!innerSelected);
                    }
                }}
                style={cellStyle}
                >
        {isSec(item) ? <><ElevatedSection title="" style={{ borderRadius: 8, flexDirection: 'row', paddingHorizontal: 8 }}>               
                    <Avatar
                        style={{}}
                        resizeMode={'cover'}
                        size={'small'}
                        shape="rounded"
                        source={{uri: item.logo_url}}
                        />
                    <View style={{flex: 1, marginLeft: 6,alignItems: 'center', justifyContent: 'center'}}>
                        <View style={{width: '100%', flexDirection: 'column-reverse',alignItems: 'flex-start', justifyContent: 'center'}}>
                            <Text style={{  fontWeight: companyProfileStyle.ticker.fontWeight, fontSize: companyProfileContentSizes['medium'].symbolSize, color:  companyProfileStyle.ticker.color}}>
                                {item.symbol ? (item.symbol === 'USD:CUR' ? '' : item.symbol) : ''}
                            </Text>
                            {<Text style={{width: '100%', marginLeft: 0, overflow: 'hidden', fontSize: companyProfileContentSizes['medium'].nameSize, fontWeight: companyProfileStyle.name.fontWeight, color: companyProfileStyle.name.color}} numberOfLines={1}>
                                {item.symbol ? (item.symbol === 'USD:CUR' ? 'Cash' : item.company_name || '') : ''}
                            </Text>}
                        </View>
                        {innerSelected && <View style={{ position: "absolute", width: "40%", aspectRatio: 1, zIndex: 50000, right: "-10%", bottom: "-10%" } as ViewStyle}>
                <View style={{ backgroundColor: "white", position: "absolute", left: "25%", top: "25%", height: "50%", width: "50%" }} />
                <Icon name="checkmark-circle-2" fill="green" style={{ height: "100%", width: "100%" }} />
            </View>}
                        
                    </View>
                </ElevatedSection>
        </> : null
        }
    </Pressable>
}