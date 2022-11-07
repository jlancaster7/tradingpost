import { getActionFromState, getStateFromPath, LinkingContext, NavigationContainerRefContext, useLinkTo } from "@react-navigation/native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
import { IndexPath } from "@ui-kitten/components";
import React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, Keyboard, TextProps, ViewProps } from "react-native";
import { PickerProps } from "../components/Picker";

import { bannerText } from "../style";


export interface IEntity<T> {
    data: Readonly<T>,
    update(updates: Partial<T>): void,
    hasChanged: boolean,
    resetData(newData: T): void
}


const ensureIterable = (value: any): value is Iterable<any> => {
    return Symbol.iterator in Object(value);
}


export const useOpacityAnim = () => {
    const opacityAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.timing(
            opacityAnim,
            {
                delay: 0.75,
                toValue: 1,
                duration: 2000,
                useNativeDriver: true
            }).start();
    }, [])
    return useMemo(() => ({
        opacityAnim,
        BannerText: (props: Omit<TextProps, "style">) => {
            return <Animated.Text
                style={[bannerText, { opacity: opacityAnim }]}
                {...props}
            />
        },
        AppearView: (props: Animated.AnimatedProps<ViewProps>) => {
            const styleProp = [{ opacity: opacityAnim } as Animated.AnimatedProps<ViewProps>["style"]]
            if (props.style) {
                if (ensureIterable(props.style))
                    styleProp.unshift(...props.style as any)
                else
                    styleProp.unshift(props.style)
            }

            return <Animated.View {...props} style={[styleProp]} />
        }
    }), [opacityAnim])
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

export function bindPicker<T, U extends keyof T>(entity: IEntity<T>, key: U, converter: EnsureConverter<T, U, IndexPath | undefined>, onSelect?: (item: IndexPath) => void) {

    return {
        //value: converter?.toType ? converter.toType(entity.data[key] as any) : (entity.data[key] as any),
        onSelect: (item) => {
            const update: Partial<T> = {};
            //console.log(item);
            entity.update({
                [key]: converter?.fromType ? converter.fromType(item) : item
            } as any)

            if (onSelect)
                onSelect(item)
        },
        // onChangeText: (v: string) => {
        //     const update: Partial<T> = {};
        //     entity.update({
        //         [key]: converter?.fromString ? converter.fromString(v) : v
        //     } as any)
        //     if (onChangeText) {
        //         onChangeText(v);
        //     }
        // }
    } as Partial<PickerProps<false>>
}
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

export default function useLinkToExt<
    ParamList extends ReactNavigation.RootParamList
>() {
    const navigation = React.useContext(NavigationContainerRefContext);
    const linking = React.useContext(LinkingContext);
    const _linkTo = useLinkTo();
    const linkTo = useCallback((to: To<ParamList>, replace?: boolean) => {

        if (navigation === undefined) {
            throw new Error(
                "Couldn't find a navigation object. Is your component inside NavigationContainer?"
            );
        }

        if (typeof to !== 'string') {
            // @ts-expect-error: This is fine
            navigation.navigate(to.screen, to.params);
            return;
        }

        if (!to.startsWith('/')) {
            throw new Error(`The path must start with '/' (${to}).`);
        }

        const { options } = linking;

        const state = options?.getStateFromPath
            ? options.getStateFromPath(to, options.config)
            : getStateFromPath(to, options?.config);

        if (state) {
            const action = getActionFromState(state, options?.config);
            if (action !== undefined) {
                navigation.dispatch(action);
            } else {
                navigation.reset(state);
            }
        } else {
            throw new Error('Failed to parse the path to a navigation state.');
        }

    }, [linking, navigation])


    return linkTo;
}
