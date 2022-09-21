"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ChipPicker = void 0;
var react_1 = require("react");
//import { Alert } from 'react-native'
//import { ChipsInputProps } from 'react-native-ui-lib/generatedTypes/src/incubator'
var react_native_ui_lib_1 = require("react-native-ui-lib");
var picker_1 = require("react-native-ui-lib/picker");
var images_1 = require("../images");
var Label_1 = require("./Label");
var SearchBar_1 = require("./SearchBar");
function ChipPicker(props) {
    //const gfd = useRef<{ focus(): void }>(null);
    var values = props.values, choices = props.choices, allowMannualEntry = props.allowMannualEntry, defaultValues = props.defaultValues;
    var _a = (0, react_1.useState)(defaultValues || []), internalValue = _a[0], setInternalValue = _a[1];
    var _b = (0, react_1.useState)(""), searchValue = _b[0], setSearchValue = _b[1];
    var searchItemFef = (0, react_1.useRef)({
        label: "",
        value: "",
        isSearch: true
    });
    var items = (0, react_1.useMemo)(function () {
        var output = choices.map(function (c) { return (__assign(__assign({}, c), { isSearch: false })); });
        if (allowMannualEntry)
            output.push(searchItemFef.current);
        return output;
    }, [choices, allowMannualEntry]); //[{ label: "A", value: "A", isSearch: false }, { label: "B", value: "BAAA", isSearch: false }]
    var cleanValues = values || internalValue;
    searchItemFef.current.value = searchValue;
    var pp = {
        showSearch: true,
        //value: cleanValues.map(v => v.value),
        hideUnderline: props.hideUnderline,
        topBarProps: {
            title: props.label
        },
        onChange: function (ev) {
            var str = ev;
            var val = str[0] === '�' ? {
                value: str,
                label: str.substring(1)
            } : items.find(function (kvp) { return str === kvp.value; });
            if (val) {
                if (!values)
                    setInternalValue(internalValue ? __spreadArray(__spreadArray([], internalValue, true), [val], false) : [val]);
                setSearchValue("");
                if (props.onChange)
                    props.onChange(val);
            }
        },
        //Need to make a custom component
        renderCustomSearch: function () {
            //return <Text style={{borderBottomColor:"#d3d3d3", borderBottomWidth:1}}> LOL</Text>
            return <SearchBar_1.SearchBar onTextChange={setSearchValue}/>;
        }
    };
    // <RN_Picker.Item key={"________search_value"} label={`Select '${searchValue}'`} value={searchValue}
    //                     labelStyle={{ color: Colors.primary }}
    //                 />
    //multiDraftValue
    var pickerRef = (0, react_1.useRef)(null);
    return <react_native_ui_lib_1.View style={{ marginBottom: 15 }}>
        {props.label && <Label_1.Label>{props.label}</Label_1.Label>}
        <react_native_ui_lib_1.View style={{
            flexDirection: "row", flexWrap: "wrap",
            paddingBottom: 11,
            paddingTop: 6,
            borderBottomWidth: props.hideUnderline ? 0 : 1,
            borderColor: "#D2D6D8"
        }}>
            {cleanValues === null || cleanValues === void 0 ? void 0 : cleanValues.map(function (kvp) { return <PickedChip manual={kvp.value[0] === '�'} {...kvp} onRemove={function (_a) {
                var value = _a.value;
                if (!values)
                    setInternalValue(internalValue.filter(function (kvp) { return kvp.value !== value; }));
                if (props.onChange)
                    props.onChange(kvp, true);
            }}/>; })}
            <picker_1["default"] ref={pickerRef} 
    // mode={"MULTI"}
    migrate renderPicker={props.customPicker || (function () {
            return props.disabled ? null : <react_native_ui_lib_1.Chip label={props.placeholder} rightIconSource={images_1.rnui.plus}/>;
        })} {...pp}>
                {items.filter(function (i) {
            return i.isSearch ||
                (!searchValue && cleanValues.find(function (v) { return v.value === i.value; }) ||
                    (searchValue.length >= 3 && (new RegExp(searchValue, 'i')).test(i.label)) ||
                    (searchValue.length && (new RegExp(searchValue, 'i')).test(i.value)));
        }).map(function (kvp) {
            return <picker_1["default"].Item key={kvp.isSearch ? "________search_value" : kvp.value} label={kvp.isSearch ? "Select '".concat(searchValue, "'") : kvp.label} value={(kvp.isSearch ? "�" : "") + kvp.value} labelStyle={kvp.isSearch ? { color: react_native_ui_lib_1.Colors.primary } : undefined}/>;
        })}
                {/* There is a bug when this is conditional..... */}
                {/* {Boolean(searchValue) &&
            <RN_Picker.Item key={"________search_value"} label={`Select '${searchValue}'`} value={searchValue}
                labelStyle={{ color: Colors.primary }}
            />} */}
            </picker_1["default"]>
        </react_native_ui_lib_1.View>
    </react_native_ui_lib_1.View>;
}
exports.ChipPicker = ChipPicker;
function PickedChip(props) {
    var _a = (0, react_1.useState)(false), canRemove = _a[0], setCanRemove = _a[1];
    return <react_native_ui_lib_1.Chip key={props.value} label={props.label} dismissColor='black' backgroundColor={react_native_ui_lib_1.Colors.primary} containerStyle={{
            borderColor: react_native_ui_lib_1.Colors.primary
        }} labelStyle={{
            color: "white",
            fontStyle: props.manual ? "italic" : undefined
        }} dismissIconStyle={{ height: 10, width: 10 }} marginR-4 marginB-8 
    // style={{
    //marginBottom: 8,
    // marginRight: 8
    //}}
    onPress={function () {
            setCanRemove(function (r) { return !r; });
        }} onDismiss={canRemove ? function () {
            props.onRemove({ label: props.label, value: props.value });
        } : undefined}/>;
}
