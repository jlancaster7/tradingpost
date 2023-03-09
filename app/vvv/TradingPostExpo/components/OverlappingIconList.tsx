import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar } from "@ui-kitten/components";
import { View, Text, ViewStyle } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"
import { AppColors } from "../constants/Colors";

export const OverlappingIconList = (props: { iconUriList: string[], maxIcons?: number, viewStyle?: ViewStyle, iconSize?: string, textColor?: string}) => {
    const {iconUriList, maxIcons, viewStyle, iconSize, textColor} = props
    const negMargin = {tiny: -13, small: -20, medium: -25, large: -30}
    return (
        <View style={[{flexDirection: 'row', alignItems: 'center'}, viewStyle]}>
            {iconUriList && iconUriList.slice(0, maxIcons).map((a, i) => <Avatar
                key={`${a}_${i}`}
                style={[i === 0 ? {} : {marginLeft: negMargin[iconSize || 'tiny']}, { zIndex: iconUriList.length - i, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc'}]}
                resizeMode={'cover'}
                size={iconSize ? iconSize : 'tiny'}
                shape="round"
                source={{uri: a}}
                />)}
            {maxIcons && iconUriList.length > maxIcons  ? <Text style={[{ fontSize: fonts.xSmall}, textColor ? {color: textColor}: {color: AppColors.primary}]}>{`+${iconUriList.length - maxIcons}`}</Text> : undefined}
        </View>
    )
}
