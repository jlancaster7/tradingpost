import React, { useEffect, useState } from 'react'
import { AllPages } from '../navigation'
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Alert, Image, ImageBackground, Linking, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { flex, fonts, paddView, row, shadow, sizes } from '../style'
import { Api, Interface } from '@tradingpost/common/api'
import { useWindowDimensions } from 'react-native'

const commentTotalVerticalMargin = sizes.rem1;
const commentTotalHorizontalMargin = sizes.rem2;
const commentSidePad = sizes.rem2;
const commentTotalBorder = 2;
const spaceOnSide = commentTotalHorizontalMargin + commentTotalBorder + commentSidePad

export function CommentView(props: {comment: Interface.ICommentPlus}) {
    const { comment } = props;
    const nav = useNavigation<NavigationProp<AllPages>>();

    return <View style={{marginVertical: sizes.rem0_5 / 2}}>
                <View 
                style={[shadow, { backgroundColor: "white", borderRadius: sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: commentTotalBorder / 2 }]}>
                    <Text style={{fontWeight: '500',padding: sizes.rem0_5, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
                        {`@${comment.handle}`}
                    </Text>
                    <Text style={{padding: sizes.rem0_5}}>
                        {comment.comment}
                    </Text>
                    <Text style={{fontStyle: 'italic', fontSize: 10, paddingHorizontal: sizes.rem0_5}}>
                        {new Date(comment.created_at).toLocaleString()}
                    </Text>
                </View>
           </View>
}