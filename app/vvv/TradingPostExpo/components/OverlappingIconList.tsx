import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar } from "@ui-kitten/components";
import { View, Text, ViewStyle } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"
import { AppColors } from "../constants/Colors";

export const OverlappingIconList = (props: { iconUriList: string[], maxIcons?: number, viewStyle?: ViewStyle, iconSize?: string}) => {
    const {iconUriList, maxIcons, viewStyle, iconSize} = props
    
    return (
        <View style={[{flexDirection: 'row', alignItems: 'center'}, viewStyle]}>
            {iconUriList && iconUriList.slice(0, maxIcons).map((a, i) => <Avatar
                style={[i === 0 ? {} : {marginLeft: -13}, { zIndex: iconUriList.length - i, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc'}]}
                resizeMode={'cover'}
                size={iconSize ? iconSize : 'tiny'}
                shape="round"
                source={{uri: a}}
                />)}
            {maxIcons && iconUriList.length > maxIcons  ? <Text style={{color: AppColors.primary, fontSize: fonts.xSmall}}>{`+${iconUriList.length - maxIcons}`}</Text> : undefined}
        </View>
    )
}
