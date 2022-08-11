import React, { ReactComponentElement, ReactElement, useEffect, useState } from "react";
import { Pressable, TextStyle } from "react-native";
import { LinearGradient, SvgFromXml } from "react-native-svg";
import { Colors, Fader, Text, View } from "react-native-ui-lib";
import { fonts, row, sizes } from "../style";
import { List, ListProps } from "./List";
import { NoDataPanel } from "./NoDataPanel";

//TODO: needs to be re-named... itsm misleading
type RowFunction<T, R> = (value: any, key: (keyof T) | undefined, item: T, index: number) => R

type EntireRowFunction<T, R> = (item: T, index: number) => R


interface TableColumnProps {
    alias?: string,
    width?: number,
    align?: "left" | "right" | undefined
}
type FieldElement<T> = (props: {
    item: T,
    index: number
    style?: (TextStyle | undefined)[]
} & TableColumnProps) => ReactElement;



export type ITableColumn<T> = {
    field?: (keyof T) | FieldElement<T>,
    style?: TextStyle
    dynamicStyle?: RowFunction<T, TextStyle>,
    stringify?: RowFunction<T, string>
} & TableColumnProps

function ensureString<T>(item?: (keyof T) | FieldElement<T>): item is (keyof T) | undefined {
    return typeof item === "string" || !item;
}

// //helper to create strongly typed table column definitions
// export class TableColumn<T, K extends keyof T> implements ITableColumn<T>{
//     field: K;
//     width?: number;
//     style?: TextStyle;
//     toString?: ((value: any, key: keyof T, item: T, index: number) => string);
//     constructor(field: K, props: Omit<ITableColumn<T>, "field" | "toString"> & { toString: (value: T[K], key: K, item: T, index: number) => string }) {
//         this.field = field
//         this.style = props.style;
//         this.width = props.width;
//         this.toString = props.toString
//     }

// }

// export function makeTableColumn<T>(field: keyof T, props: //Pick<ITableColumn<T>, "width" | "style"|"toString"> &
//     { toString?(value: T[typeof field], key: typeof field, item: T, index: number): string }

// ): ITableColumn<T> {
//     return {
//         field,
//         //width: props.width,
//         //style: props.style,
//         toString: props.toString as ((value: any, key: keyof T, item: T, index: number) => string)
//     }
// }

export const stringyDate = (dts?: string) => {
    const v = dts ? new Date(dts) : new Date();
    return `${v?.getMonth() + 1}/${v?.getDate()}/${v?.getFullYear().toString().substring(2, 4)}`
}
export function Table<T>(
    props: {
        columns: ITableColumn<T>[],
        elevated?: boolean,
        nestedScrollEnabled?: boolean,
        rowPressed?: EntireRowFunction<T, void>,
        hideHeader?: boolean,
    } & ListProps<T>) {

    const
        { data, columns, nestedScrollEnabled, elevated, rowPressed } = props,
        columnStyle: Partial<Record<number, (TextStyle | undefined)[]>> = {},
        headerStyle: Partial<Record<number, (TextStyle | undefined)[]>> = {},
        headerAlias: Partial<Record<number, string>> = {},
        columnDynamicStyle: Partial<Record<number, RowFunction<T, TextStyle>>> = {},
        columnsToString: Partial<Record<number, RowFunction<T, string>>> = {};



    columns.forEach((c, i) => {
        columnStyle[i] = [{
            fontSize: fonts.xSmall,
            width: c.width,
            flex: c.width === undefined ? 1 : undefined,
            textAlign: c.align || "center",
            marginLeft: c.align === "left" ? 0 : undefined

        }, c.style,];

        headerStyle[i] = [{
            fontSize: fonts.small,
            width: c.width,
            flex: c.width === undefined ? 1 : undefined,
            textAlign: c.align || "center",
            color: Colors.secondary,
            //paddingBottom: 16
        }]

        if (c.alias)
            headerAlias[i] = c.alias;

        if (c.dynamicStyle)
            columnDynamicStyle[i] = c.dynamicStyle;

        if (c.stringify)
            columnsToString[i] = c.stringify;

    })

    return (<List
        maxDisaplyCount={props.maxDisaplyCount}
        maxDisaplyText={props.maxDisaplyText}
        keyExtractor={props.keyExtractor}
        ListHeaderComponent={props.hideHeader ? undefined : () => {
            return <View key={"table_header"} style={{ alignItems: "stretch" }}>
                <View style={[row, { backgroundColor: "white" }]}>
                    {columns.map((c, i) => {
                        return <Text key={`header_${i}`} numberOfLines={1} style={headerStyle[i]} >{headerAlias[i] || c.field?.toString()}</Text>
                    })}
                </View>
                {/**Was just for testing... **/}
                <View style={{ height: 16 }}>
                    <Fader size={16} position={Fader.position.TOP} />
                </View>
            </View>
        }}
        nestedScrollEnabled={nestedScrollEnabled}
        data={data}
        datasetKey={props.datasetKey}
        loadingItem={null}
        renderItem={(info) => {
            //return <View><Text>{JSON.stringify(info.item)}</Text></View>
            return <Pressable
                onPress={rowPressed ? () => {
                    rowPressed(info.item, info.index)
                } : undefined}
                key={`row_${info.index}`}
                style={[row, props.elevated ? {
                    marginHorizontal: 2,
                    paddingVertical: 8,
                    backgroundColor: "white",
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 4,
                    marginBottom: 16,
                    elevation: 4,
                    shadowOffset: { height: 2, width: 2 },
                    shadowColor: "black",
                    shadowOpacity: 0.125,
                    shadowRadius: 0.25
                } : { paddingVertical: 8, marginHorizontal: 4 }]}>
                {
                    props.columns.map((c, i) => {
                        const key = `column_${i}`,
                            colStyle = columnStyle[i];

                        if (ensureString(c.field)) {
                            const toString = columnsToString[i],
                                dynamicStyle = columnDynamicStyle[i],
                                evaluatedStyle = dynamicStyle ? [...[colStyle || []], dynamicStyle(c.field ? info.item[c.field] : undefined, c.field, info.item, info.index)] : colStyle,
                                evaluatedValue = toString ? toString(c.field ? info.item?.[c.field] : undefined, c.field, info.item, info.index) : (c.field ? info.item?.[c.field] : undefined)
                            return <Text key={key} numberOfLines={1} style={evaluatedStyle} >{evaluatedValue}</Text>
                        }
                        else {
                            const FieldElem = c.field;
                            return <FieldElem key={key} item={info.item} index={info.index} width={c.width} alias={c.alias} style={colStyle} />
                        }
                    })
                }
            </Pressable >
        }} />)
}