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
exports.__esModule = true;
exports.useIsKeyboardVisible = exports.bindPicker = exports.bindTextInputBase = exports.bindTextInput = exports.useReadonlyEntity = exports.useOpacityAnim = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var ensureIterable = function (value) {
    return Symbol.iterator in Object(value);
};
var useOpacityAnim = function () {
    var opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(opacityAnim, {
            delay: 0.75,
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, []);
    return (0, react_1.useMemo)(function () { return ({
        opacityAnim: opacityAnim,
        BannerText: function (props) {
            return <react_native_1.Animated.Text style={[style_1.bannerText, { opacity: opacityAnim }]} {...props}/>;
        },
        AppearView: function (props) {
            var styleProp = [{ opacity: opacityAnim }];
            if (props.style) {
                if (ensureIterable(props.style))
                    styleProp.unshift.apply(styleProp, props.style);
                else
                    styleProp.unshift(props.style);
            }
            return <react_native_1.Animated.View {...props} style={[styleProp]}/>;
        }
    }); }, [opacityAnim]);
};
exports.useOpacityAnim = useOpacityAnim;
function useReadonlyEntity(seedValue) {
    var _a = (0, react_1.useState)(seedValue), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(false), hasChanged = _b[0], setHasChanged = _b[1];
    return {
        data: data,
        hasChanged: hasChanged,
        resetData: (0, react_1.useCallback)(function (d) {
            setHasChanged(false);
            setData(d);
        }, []),
        update: (0, react_1.useCallback)(function (updates) {
            setHasChanged(true);
            setData(function (_entity) { return (__assign(__assign({}, _entity), updates)); });
        }, [])
    };
}
exports.useReadonlyEntity = useReadonlyEntity;
function bindTextInput(entity, key, converter, onChangeText) {
    return bindTextInputBase(entity, key, converter, {
        valueKey: "value",
        onChangeTextKey: "onChangeText"
    }, onChangeText);
}
exports.bindTextInput = bindTextInput;
function bindTextInputBase(entity, key, converter, bindKeys, onChangeText) {
    var _a;
    var output = (_a = {},
        _a[bindKeys.onChangeTextKey] = function (v) {
            var _a;
            var update = {};
            entity.update((_a = {},
                _a[key] = (converter === null || converter === void 0 ? void 0 : converter.fromType) ? converter.fromType(v) : v,
                _a));
            if (onChangeText) {
                onChangeText(v);
            }
        },
        _a);
    if (bindKeys.valueKey)
        output[bindKeys.valueKey] = (converter === null || converter === void 0 ? void 0 : converter.toType) ? converter.toType(entity.data[key]) : entity.data[key];
    return output;
}
exports.bindTextInputBase = bindTextInputBase;
function bindPicker(entity, key, converter, onSelect) {
    return {
        //value: converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any),
        onSelect: function (item) {
            var _a;
            var update = {};
            //console.log(item);
            entity.update((_a = {},
                _a[key] = (converter === null || converter === void 0 ? void 0 : converter.fromType) ? converter.fromType(item) : item,
                _a));
            if (onSelect)
                onSelect(item);
        }
    };
}
exports.bindPicker = bindPicker;
// export function bindMultiPicker<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, (number | string)[] | undefined>, onChange?: (item: (string | number)[]) => void) {
//     return {
//         value: converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any),
//         onChange: (item) => {
//             //const update: Partial<T> = {};
//             //console.log(item);
//             entity.update({
//                 [key]: converter?.fromType ? converter.fromType(item) : item
//             } as any)
//             if (onChange)
//                 onChange(item)
//         },
//         // onChangeText: (v: string) => {
//         //     const update: Partial<T> = {};
//         //     entity.update({
//         //         [key]: converter?.fromString ? converter.fromString(v) : v
//         //     } as any)
//         // if (onChangeText) {
//         //     onChangeText(v);
//         // }
//         //  }
//     } as Partial<PickerProps<true>>
// }
// export function bindSwitch<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, boolean | undefined>, invert?: boolean, onChange?: (item: boolean) => void) {
//     let calcedValue = converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any);
//     if (invert)
//         calcedValue = !calcedValue;
//     return {
//         value: calcedValue,
//         onValueChange: (item) => {
//             let itemCalced = converter?.fromType ? converter.fromType(item) : item;
//             if (invert)
//                 itemCalced = !itemCalced;
//             const update: Partial<T> = {};
//             entity.update({
//                 [key]: itemCalced
//             } as any)
//             if (onChange)
//                 onChange(item)
//         },
//     } as SwitchProps
// }
function useIsKeyboardVisible() {
    var _a = (0, react_1.useState)(false), isKeyboardVisible = _a[0], setIsKeyboardVisible = _a[1];
    (0, react_1.useLayoutEffect)(function () {
        var showSubscription = react_native_1.Keyboard.addListener("keyboardDidShow", function () {
            setIsKeyboardVisible(true);
        });
        var hideSubscription = react_native_1.Keyboard.addListener("keyboardDidHide", function () {
            setIsKeyboardVisible(false);
        });
        return function () {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    return {
        isKeyboardVisible: isKeyboardVisible
    };
}
exports.useIsKeyboardVisible = useIsKeyboardVisible;
//export type ToastMessageFunction = (message: string, duration?: number, override?: ToastProps) => void
// export function useToast() {
//     const [toastProps, setToastProps] = useState<ToastProps>()
//     const toastMessage = useCallback((message: string, duration = 2500, override?: ToastProps) => {
//         setToastProps({
//             autoDismiss: duration,
//             message,
//             showDismiss: true,
//             visible: true,
//             //    color: "red",
//             //  backgroundColor: "white",
//             onDismiss: () => setToastProps((existing) => ({ ...existing, visible: false })),
//             ...override
//         })
//     }, []);
//     return {
//         toastProps,
//         //setToastProps,
//         toastMessage
//     }
// }
// export function useOnComponentAppeared(mainComponentId: string, memoizedAction: () => void) {
//     useEffect(() => {
//         const sub = Navigation.events().registerComponentDidAppearListener(
//             ({ componentId }) => {
//                 if (componentId === mainComponentId)
//                     memoizedAction()
//             })
//         return () => sub.remove();
//     }, [memoizedAction])
// }
