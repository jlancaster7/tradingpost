import React, { useEffect, useState } from 'react'
import { RootStackParamList } from '../navigation/pages'
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Alert, Image, ImageBackground, Linking, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { flex, fonts, paddView, row, shadow, sizes } from '../style'
import { Api, Interface } from '@tradingpost/common/api'
import { Header, Subheader } from './Headers'
import { useWindowDimensions } from 'react-native'

const commentTotalVerticalMargin = sizes.rem1;
const commentTotalHorizontalMargin = sizes.rem2;
const commentSidePad = sizes.rem2;
const commentTotalBorder = 2;
const spaceOnSide = commentTotalHorizontalMargin + commentTotalBorder + commentSidePad

export function CommentView(props: {comment: Interface.ICommentPlus}) {
    const { comment } = props;
    const nav = useNavigation<NavigationProp<RootStackParamList>>();

    return <View style={{marginVertical: sizes.rem0_5 / 2}}>
                <View 
                style={[shadow, { backgroundColor: "white", borderRadius: sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: commentTotalBorder / 2 }]}>
                    <View style={[flex, { borderBottomWidth: 1, borderBottomColor: "#ccc", padding: sizes.rem1 }]}>
                    <Pressable onPress={() => {
                        if (props.comment.user_id)
                            nav.navigate("Profile", {
                                userId: props.comment.user_id
                            } as any);
                    }}>
                        <Subheader text={"@" + comment.handle} style={{ color: "black", fontWeight: "bold", marginBottom: 0 }}/>
                    </Pressable>
                    </View>
                                        {/*<Text style={{fontWeight: '500',padding: sizes.rem0_5, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
                        {`@${comment.handle}`}
                    </Text>*/}
                    <Text style={{padding: sizes.rem0_5, fontSize: fonts.small}}>
                        {comment.comment}
                    </Text>
                    <Text style={{fontSize: fonts.xSmall, padding: sizes.rem0_5 }}>
                        {new Date(comment.created_at).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'})}
                    </Text>
                </View>
           </View>
}