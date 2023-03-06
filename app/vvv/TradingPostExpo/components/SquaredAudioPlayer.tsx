/*
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { Avatar, Icon } from "@ui-kitten/components";
import { View, Text, ViewStyle, Pressable } from "react-native";
import { toDollarsAndCents, toPercent2 } from "../utils/misc"
import { DownTriangle, UpTriangle } from "../images"
import { fonts, sizes, companyProfileContentSizes, companyProfileStyle, shaded } from "../style";
import { NoteEditor, SecPressable } from "../screens/WatchlistViewerScreen"
import { Api } from "@tradingpost/common/api"
import { AppColors } from "../constants/Colors";
import { OverlappingIconList } from "./OverlappingIconList";
import TrackPlayer, { State, useTrackPlayerEvents, Event } from 'react-native-track-player';
import { AudioPlayerButtons } from "./AudioPlayerButtons";

export const SquaredAudioPlayer = (props: { iconUriList: string[], description: string, trackNumber: number, maxIcons?: number, viewStyle?: ViewStyle, iconSize?: string}) => {
    const {iconUriList, description, maxIcons, viewStyle, iconSize, trackNumber} = props

    return (
        <View style={[shaded, {flex: 1, backgroundColor: companyProfileStyle.upBackgroundColor, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginHorizontal: 8}]}>
            <OverlappingIconList iconSize={iconSize} iconUriList={iconUriList} maxIcons={maxIcons} viewStyle={viewStyle}/>
            <Text style={{ color: 'grey', textAlign: 'center', marginVertical: sizes.rem0_25}}>
                {description}
            </Text>
            <AudioPlayerButtons trackNumber={trackNumber} />
            <Text style={{ fontSize: fonts.xSmall, color: 'grey', textAlign: 'center'}}>
                {'0:00 / 0:59'}
            </Text>

        </View>
    )
}
*/