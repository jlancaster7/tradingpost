"use strict";
exports.__esModule = true;
exports.TextField = void 0;
var react_1 = require("react");
//import { Colors } from 'react-native-ui-lib';
var components_1 = require("@ui-kitten/components");
function TextField(props) {
    var rnuRef = (0, react_1.useRef)(null);
    var _a = (0, react_1.useState)(), caption = _a[0], setCaption = _a[1];
    var _b = (0, react_1.useState)(), valueTracker = _b[0], setValueTracker = _b[1];
    (0, react_1.useEffect)(function () {
        setCaption(props.caption);
    }, [props.caption]);
    (0, react_1.useEffect)(function () {
        setValueTracker(props.value);
    }, [props.value]);
    var validate = props.validate;
    if (props.textInputRef) {
        props.textInputRef.current = {
            errorMessage: /* props.errorMessage instanceof Array ? props.errorMessage.join(",") :*/ props.errorMessage,
            validate: function () { return validate ? validate(valueTracker) : true; },
            field: rnuRef
        };
    }
    //const tt = { spellCheck: true, autoCorrect:false } as TextInputProps
    return <components_1.Input ref={rnuRef} numberOfLines={props.numberOfLines} spellCheck={props.spellCheck || false} autoCorrect={props.autoCorrect || false} editable={!props.disabled} 
    //disabledColor={props.disabledColor || Colors.grey20}
    //placeholder="Enter Email..."
    //validateOnChange={props.validateOnChange}
    caption={caption} accessoryLeft={props.accessoryLeft} accessoryRight={props.accessoryRight} 
    //validate={props.validate}
    //errorMessage={props.errorMessage}
    value={props.value} 
    //markRequired={props.markRequired}
    //ref={props.textInputRef?.current?.field}
    onSubmitEditing={props.onSubmitEditing} label={function (textProps) {
            return props.label ? <components_1.Text {...textProps}>{props.label}{<components_1.Text {...textProps} style={[
                        textProps === null || textProps === void 0 ? void 0 : textProps.style,
                        {
                            color: "red"
                        }
                    ]}>{props.markRequired ? "*" : ""}</components_1.Text>}</components_1.Text> :
                <components_1.Text></components_1.Text>;
        }} onChangeText={function (t) {
            var _a;
            setValueTracker(t);
            if (validate && props.validateOnChange) {
                var errorMessage_1 = undefined;
                var newCaption_1 = undefined;
                if (!validate(t)) {
                    errorMessage_1 = props.errorMessage;
                    newCaption_1 = function () { return <components_1.Text category={"c1"} style={{ color: "red" }}>{errorMessage_1}</components_1.Text>; };
                }
                if ((_a = props.textInputRef) === null || _a === void 0 ? void 0 : _a.current) {
                    props.textInputRef.current.errorMessage = errorMessage_1;
                    //props.textInputRef.current.validate = () => validate(t);
                }
                setCaption(function () { return newCaption_1; });
            }
            if (props.onChangeText)
                props.onChangeText(t);
        }} secureTextEntry={props.secureTextEntry} returnKeyType={props.returnKeyType} placeholder={props.placeholder} 
    //error={props.error}
    style={props.style}/>;
}
exports.TextField = TextField;
