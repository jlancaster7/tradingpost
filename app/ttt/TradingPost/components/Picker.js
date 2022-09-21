"use strict";
exports.__esModule = true;
exports.Picker = void 0;
var react_1 = require("react");
//import { rnui } from '../images'
var react_native_1 = require("react-native");
var components_1 = require("@ui-kitten/components");
function Picker(props) {
    //const [_value, setValues] = useState<PickerProps<T>["value"]>(props.value);
    var _a;
    // useLayoutEffect(() => {
    //     setValues();
    // }, [props.value])
    return <components_1.Select 
    //rightIconSource={rnui.chevronDown}
    //spellCheck={false} 
    //migrate 
    //selectionLimit={props.selectionLimit}
    //multiSelect={props.multiSelect}
    //mode={props.multiSelect ? "MULTI" : "SINGLE"}
    {...props} 
    //value={(p) => <Text {...p}></Text>}
    value={props.value instanceof Array ? props.items.map(function (item) { return "TEST"; }).filter(function (v) { return v; }).join(",") : ((_a = props.items.find(function (v) { return v.value === props.value; })) === null || _a === void 0 ? void 0 : _a.label) || props.placeholder} onSelect={function (v) {
            // if (v instanceof Array) {
            //     setValues(v.map((v) => props.items[v.row].value) as any);
            // }
            // else {
            //     // console.log("TESTTTTT::::::" + props.items[v.row].value as any);
            //     setValues(props.items[v.row].value as any);
            // }
            if (props.onSelect)
                props.onSelect(v);
        }} selectedIndex={props.multiSelect ? props.items.map(function (i, idx) {
            return Boolean(props.value.find(function (_item) { return _item.value === i.value; })) ?
                new components_1.IndexPath(idx) : null;
        }).filter(function (v) { return v; }) :
            new components_1.IndexPath(props.items.findIndex(function (i, idx) { return i.value === props.value; }))}>
        {props.items.map(function (i) { return <components_1.SelectItem accessoryLeft={function (props) { return <react_native_1.Image {...props} source={{ uri: i.iconUrl }}/>; }} title={i.label} key={i.value}/>; })}
    </components_1.Select>;
}
exports.Picker = Picker;
