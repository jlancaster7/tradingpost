import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar } from "@ui-kitten/components";
import { View, Text, ViewStyle } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"
import { AppColors } from "../constants/Colors";

export const OverlappingIconCollage = (props: { iconUriList: string[], maxIcons?: number, viewStyle?: ViewStyle}) => {
    const {iconUriList, maxIcons, viewStyle} = props
    
    return (
        <View style={{alignItems: 'center'}}>
            <View style={[{flexDirection: 'row', alignItems: 'center'}, viewStyle]}>
                {iconUriList && iconUriList.slice(0, 2).map((a, i) => <Avatar
                    style={[i === 0 ? {} : {marginLeft: -13}, { zIndex: iconUriList.length - i, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc'}]}
                    resizeMode={'cover'}
                    size={'small'}
                    shape="round"
                    source={{uri: a}}
                    />)}
                {maxIcons && iconUriList.length > maxIcons  ? <Text style={{color: AppColors.primary, fontSize: fonts.xSmall}}>{`+${iconUriList.length - maxIcons}`}</Text> : undefined}
            </View>
            <View style={[{flexDirection: 'row', alignItems: 'center', marginTop: -5, zIndex: 2}, viewStyle]}>
                {iconUriList && iconUriList.slice(2, 5).map((a, i) => <Avatar
                    style={[i === 0 ? {} : {marginLeft: -13}, { zIndex: iconUriList.length - i, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc'}]}
                    resizeMode={'cover'}
                    size={'small'}
                    shape="round"
                    source={{uri: a}}
                    />)}
                {maxIcons && iconUriList.length > maxIcons  ? <Text style={{color: AppColors.primary, fontSize: fonts.xSmall}}>{`+${iconUriList.length - maxIcons}`}</Text> : undefined}
            </View>
            <View style={[{flexDirection: 'row', alignItems: 'center', marginTop: -5}, viewStyle]}>
                {iconUriList && iconUriList.slice(5, 7).map((a, i) => <Avatar
                    style={[i === 0 ? {} : {marginLeft: -13}, { zIndex: iconUriList.length - i, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc'}]}
                    resizeMode={'cover'}
                    size={'small'}
                    shape="round"
                    source={{uri: a}}
                    />)}
                {maxIcons && iconUriList.length > maxIcons  ? <Text style={{color: AppColors.primary, fontSize: fonts.xSmall}}>{`+${iconUriList.length - maxIcons}`}</Text> : undefined}
            </View>
        </View>
    )
}
