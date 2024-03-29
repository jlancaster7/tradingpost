import React, { useEffect, useState } from 'react'
import { RootStackParamList } from '../navigation/pages'
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Alert, Image, ImageBackground, Linking, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { flex, fonts, paddView, row, shadow, sizes } from '../style'
import { Api, Interface } from '@tradingpost/common/api'
import { Header, Subheader } from './Headers'
import { useWindowDimensions } from 'react-native'
import { useAppUser } from '../Authentication'
import { toFormatedDateTime } from '../utils/misc'
import { ProfileButton } from './ProfileButton'

const commentTotalVerticalMargin = sizes.rem1;
const commentTotalHorizontalMargin = sizes.rem2;
const commentSidePad = sizes.rem2;
const commentTotalBorder = 2;
const spaceOnSide = commentTotalHorizontalMargin + commentTotalBorder + commentSidePad

export function CommentView(props: { comment: Interface.ICommentPlus }) {
    const { comment } = props;
    return <CommentViewV2
        comment={{
            ...comment,
            created_at: String(comment.created_at),
            profile: {
                display_name: comment.display_name,
                handle: comment.handle,
                id: comment.user_id,
                //TODO: not sure if this is required
                subscription: comment.subscription as any,
                tags: []
            }
        }}
    />
}


export function CommentViewV2(props: { comment: Interface.ICommentBasic }) {
    const { comment } = props;
    const { loginState } = useAppUser()

    const nav = useNavigation<NavigationProp<RootStackParamList>>();

    return <View style={[{ marginVertical: sizes.rem0_5 / 2 },]}>
        <View style={[{ alignItems: 'center' }, props.comment.user_id === loginState?.appUser?.id ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' }]}>
            <Pressable
                onPress={() => {
                    if (props.comment.user_id)
                        nav.navigate("Profile", {
                            userId: props.comment.user_id
                        } as any);
                }} style={[row, {
                    alignItems: "center",
                    overflow: "hidden",
                    //borderBottomColor: "#ccc",
                    //borderBottomWidth: 1,
                    padding: sizes.rem1 / 2
                }]}>
                {
                    <ProfileButton userId={comment.user_id}
                        profileUrl={comment.profile.profile_url || ""} size={48} />
                }
            </Pressable>
            <View style={{ width: '80%', paddingBottom: 6 }}>
                <View style={[shadow, { backgroundColor: "white", borderRadius: sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: commentTotalBorder / 2, justifyContent: 'center', minHeight: 48 }]}>
                    {/*<View style={[flex, { borderBottomWidth: 1, borderBottomColor: "#ccc", padding: sizes.rem0_5 }]}>
                            </View>*/}
                    {/*<Text style={{fontWeight: '500',padding: sizes.rem0_5, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
                                {`@${comment.handle}`}
                            </Text>*/}
                    <Text style={{ padding: sizes.rem0_5, fontSize: 14 }}>
                        {comment.comment}
                    </Text>
                </View>
            </View>
        </View>
        <Text style={[{ fontSize: fonts.medium / 2, paddingHorizontal: sizes.rem1, color: '#9D9D9D' }, props.comment.user_id === loginState?.appUser?.id ? {} : { textAlign: 'right' }]}>
            {`@${comment.profile.handle}   ${toFormatedDateTime(String(comment.created_at))}`}
        </Text>
    </View>
}