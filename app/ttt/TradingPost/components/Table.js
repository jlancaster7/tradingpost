"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Table = exports.stringyDate = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
//import { Colors, Fader, Text, View } from "react-native-ui-lib";
var style_1 = require("../style");
var List_1 = require("./List");
var theme_light_json_1 = require("../theme-light.json");
function ensureString(item) {
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
var stringyDate = function (dts) {
    var v = dts ? new Date(dts) : new Date();
    return "".concat((v === null || v === void 0 ? void 0 : v.getMonth()) + 1, "/").concat(v === null || v === void 0 ? void 0 : v.getDate(), "/").concat(v === null || v === void 0 ? void 0 : v.getFullYear().toString().substring(2, 4));
};
exports.stringyDate = stringyDate;
function Table(props) {
    var data = props.data, columns = props.columns, nestedScrollEnabled = props.nestedScrollEnabled, elevated = props.elevated, rowPressed = props.rowPressed, columnStyle = {}, headerStyle = {}, headerAlias = {}, columnDynamicStyle = {}, columnsToString = {};
    columns.forEach(function (c, i) {
        columnStyle[i] = [{
                fontSize: style_1.fonts.xSmall,
                lineHeight: style_1.fonts.medium,
                width: c.width,
                flex: c.width === undefined ? 1 : undefined,
                textAlign: c.align || "center",
                marginLeft: c.align === "left" ? 0 : undefined
            }, c.style,];
        headerStyle[i] = [{
                fontSize: style_1.fonts.small,
                width: c.width,
                flex: c.width === undefined ? 1 : undefined,
                textAlign: c.align || "center",
                color: theme_light_json_1["default"]["color-info-800"]
            }, c.headerStyle];
        if (c.alias)
            headerAlias[i] = c.alias;
        if (c.dynamicStyle)
            columnDynamicStyle[i] = c.dynamicStyle;
        if (c.stringify)
            columnsToString[i] = c.stringify;
    });
    return <List_1.List maxPage={props.maxPage} maxDisaplyCount={props.maxDisaplyCount} maxDisaplyText={props.maxDisaplyText} keyExtractor={props.keyExtractor} ListHeaderComponent={props.hideHeader ? undefined : function () {
            return <react_native_1.View key={"table_header"} style={{ alignItems: "stretch" }}>
                <react_native_1.View style={[style_1.row, { backgroundColor: "white" }]}>
                    {columns.map(function (c, i) {
                    var _a;
                    return <react_native_1.Text key={"header_".concat(i)} numberOfLines={1} style={headerStyle[i]}>{headerAlias[i] || ((_a = c.field) === null || _a === void 0 ? void 0 : _a.toString())}</react_native_1.Text>;
                })}
                </react_native_1.View>
                {/**Was just for testing... **/}
                <react_native_1.View style={{ height: 16 }}>
                    {/* <Fader size={16} position={Fader.position.TOP} /> */}
                </react_native_1.View>
            </react_native_1.View>;
        }} nestedScrollEnabled={nestedScrollEnabled} data={data} datasetKey={props.datasetKey} noDataMessage={props.noDataMessage} loadingItem={null} renderItem={function (info) {
            //return <View><Text>{JSON.stringify(info.item)}</Text></View>
            return info.item ?
                <react_native_1.Pressable onPress={rowPressed ? function () {
                        rowPressed(info.item, info.index);
                    } : undefined} key={"row_".concat(info.index)} style={[props.elevated ? style_1.elevated : { paddingVertical: 8, marginHorizontal: 4 }]}>
                    <react_native_1.View style={style_1.row}>
                        {props.columns.map(function (c, i) {
                        var _a, _b;
                        var key = "column_".concat(i), colStyle = columnStyle[i];
                        if (ensureString(c.field)) {
                            var toString_1 = columnsToString[i], dynamicStyle = columnDynamicStyle[i], evaluatedStyle = dynamicStyle ? __spreadArray(__spreadArray([], [colStyle || []], false), [dynamicStyle(c.field ? info.item[c.field] : undefined, c.field, info.item, info.index)], false) : colStyle, evaluatedValue = toString_1 ? toString_1(c.field ? (_a = info.item) === null || _a === void 0 ? void 0 : _a[c.field] : undefined, c.field, info.item, info.index) : (c.field ? (_b = info.item) === null || _b === void 0 ? void 0 : _b[c.field] : undefined);
                            return <react_native_1.Text key={key} numberOfLines={1} style={evaluatedStyle}>{evaluatedValue}</react_native_1.Text>;
                        }
                        else {
                            var FieldElem = c.field;
                            return <FieldElem key={key} item={info.item} index={info.index} width={c.width} alias={c.alias} style={colStyle}/>;
                        }
                    })}
                    </react_native_1.View>
                    {props.renderAuxItem && props.renderAuxItem(info)}
                </react_native_1.Pressable> :
                <react_native_1.Text>Loading...</react_native_1.Text>;
        }}/>;
}
exports.Table = Table;
