import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Alert, Keyboard, TextInputProps } from "react-native";
//import { ToastProps } from "react-native-ui-lib/typings/components/Toast";
//import { ITempUser } from "../interfaces/IUser";
//import { PickerProps } from '../components/Picker'
//import { PickerItemLabeledValue } from "react-native-ui-lib/typings";
//import { SwitchProps } from "react-native-ui-lib";
//import { Navigation } from "react-native-navigation";

export interface IEntity<T> {
    data: Readonly<T>,
    update(updates: Partial<T>): void,
    hasChanged: boolean,
    resetData(newData: T): void
}

export function useReadonlyEntity<T>(seedValue: T): IEntity<T> {
    const [data, setData] = useState<Readonly<T>>(seedValue)
    const [hasChanged, setHasChanged] = useState(false);
    return {
        data,
        hasChanged,
        resetData: useCallback(function (d) {
            setHasChanged(false);
            setData(d);
        }, []),
        update: useCallback((updates: Partial<T>) => {
            setHasChanged(true);
            setData((_entity) => ({
                ..._entity,
                ...updates
            }))
        }, [])
    }
}

type EnsureTypeFrom<T, U extends keyof T, S> = T[U] extends (S) ? (((v: S) => S) | undefined | null) : (v: S) => T[U]
type EnsureTypeTo<T, U extends keyof T, S> = T[U] extends (S) ? (((v: S) => S) | undefined | null) : (v: T[U]) => S

type ConvertType<T, U extends keyof T, S> = {
    toType: EnsureTypeTo<T, U, S>
    fromType: EnsureTypeFrom<T, U, S>
}

type EnsureConverter<T, U extends keyof T, S> = T[U] extends (S) ? (ConvertType<T, U, S> | undefined | null) : ConvertType<T, U, S>

export function bindTextInput<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, string | undefined>, onChangeText?: (text: string) => void) {
    return bindTextInputBase(entity, key, converter, {
        valueKey: "value",
        onChangeTextKey: "onChangeText"
    }, onChangeText)
}

export function bindTextInputBase<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, string | undefined>, bindKeys: { valueKey?: string, onChangeTextKey: string }, onChangeText?: (text: string) => void) {
    const output = {
        [bindKeys.onChangeTextKey]: (v: string) => {
            const update: Partial<T> = {};
            entity.update({
                [key]: converter?.fromType ? converter.fromType(v) : v
            } as any)
            if (onChangeText) {
                onChangeText(v);
            }
        }
    };
    if (bindKeys.valueKey)
        output[bindKeys.valueKey] = converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any)
    return output;
}

// export function bindPicker<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, number | string | undefined>, onChange?: (item: string | number) => void) {

//     return {
//         value: converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any),
//         onChange: (item) => {
//             const update: Partial<T> = {};
//             console.log(item);
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
//     } as Partial<PickerProps<false>>
// }
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


export function useIsKeyboardVisible() {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useLayoutEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setIsKeyboardVisible(false)
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    return {
        isKeyboardVisible
    }
}


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