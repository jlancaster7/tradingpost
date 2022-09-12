import React, { useEffect, useState } from 'react'
import { Alert, Image, ImageBackground, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, Icon } from '@ui-kitten/components'

import { flex, fonts, row, shadow, sizes } from '../style'
import UserLogo from '@iconify/icons-mdi/user'
import { IconifyIcon } from './IconfiyIcon'
import { Header, Subheader } from './Headers'
import { PrimaryChip } from './PrimaryChip'
import { BookmarkActive, BookmarkIcons, CommentIcon, navIcons, postBg, social, UpvoteIcon } from '../images'
import { social as socialStyle } from '../style'
import { IconButton } from './IconButton'
//import { IPostList } from '../api/entities/interfaces'
import { LogoImage } from './LogoImage'
//import { ensureCurrentUser } from '../apis/Authentication'
//import { WebView } from 'react-native-webview';
import { color } from 'react-native-reanimated'
//import { screens } from '../navigationComponents'
//import { fullDashOptions } from '../layouts/DashboardLayout'
import { AsyncPressable } from './AsyncPressable'
import { AppColors } from '../constants/Colors'
import { Api, Interface } from '@tradingpost/common/api'
import { HtmlView } from './HtmlView'
import { useWindowDimensions } from 'react-native'
import { ProfileButton } from './ProfileButton'
import { useToast } from 'react-native-toast-notifications'
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { AllPages } from '../navigation'
//import { setBookmarked } from '../apis/PostApi'
//import { openProfileScreen } from '../screens/ProfileScreen'


const postTotalVerticalMargin = sizes.rem1;
const postTotalHorizontalMargin = sizes.rem2;
const postSidePad = sizes.rem2;
const postTotalBorder = 2//4;
export const spaceOnSide = postTotalHorizontalMargin + postTotalBorder + postSidePad

export const postInnerHeight = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    const size = (itm as Interface.IElasticPost | undefined)?._source.size
    if (itm?._source.postType === "substack") {
        return 200;
    }
    else if (size) {
        return windowWidth / size.aspectRatio + (itm?._source.postType === "tweet" ? 20 * windowWidth / itm._source.size.maxWidth : 0);
    }
    else if (itm?._source.postType === "youtube") {
        return windowWidth / (390 / 230);
    }
    else if (itm?._source.postType === "spotify") {
        return windowWidth / (360 / 162);
    }
    else {
        return 200;
    }
}
export const resolvePostContent = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    switch (itm?._source.postType) {
        case "youtube":
            return itm._source.postUrl.replace("https://www.youtube.com/watch?v=", "//www.youtube.com/embed/");
        case 'tweet':
            return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head><body style="margin:0; padding:0;width:${itm._source.size.maxWidth}px;transform: scale(${windowWidth / itm._source.size.maxWidth});transform-origin: top left;">
            ${itm._source.content.htmlBody}
            </body></html>`
        case 'spotify':
            const matches = /src="(.*)"/.exec(itm._source.content.body);
            return matches?.[1] || "";
        case 'substack':
        //return SubstackView({post: itm});
        /*
        return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head>
        <body style="margin:0; padding:0;width:${itm?._source.size.maxWidth}px;transform: scale(${windowWidth / itm._source.size.maxWidth});transform-origin: top left;">
        <h1>${itm?._source.content.title}</h1>
        <p>${itm?._source.content.body}</p>
        </body></html>`
        */
        default:
            return itm?._source.content.htmlBody || "";
    }
}
export function PostView(props: { post: Interface.IElasticPostExt }) {
    const { post } = props
    const nav = useNavigation<NavigationProp<AllPages>>();

    const [isBookmarked, setIsBookmarked] = useState(Boolean(post.ext.is_bookmarked));
    const [isUpvoted, setIsUpvoted] = useState(Boolean(post.ext.is_upvoted));

    const [showStatus, setShowStatus] = useState(false);
    return <View style={{ marginHorizontal: postTotalHorizontalMargin / 2, marginVertical: postTotalVerticalMargin / 2 }} >
        <View
            style={[shadow, { backgroundColor: "white", borderRadius: sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: postTotalBorder / 2 }]}>
            <Pressable
                onPress={() => {
                    //openProfileScreen(props.parentComponentId, props.post.creator.id_creator);
                }} style={[row, { alignItems: "center", overflow: "hidden", borderBottomColor: "#ccc", borderBottomWidth: 1, padding: sizes.rem1 / 2 }]}>
                {
                    <ProfileButton userId={props.post._source.user.id} profileUrl={props.post.ext.user?.profile_url || ""} size={56} />
                }
                <View style={[flex, { marginLeft: sizes.rem1_5 }]}>
                    <Pressable onPress={() => {
                        if (props.post._source.user.id)
                            nav.navigate("Profile", {
                                userId: props.post._source.user.id
                            } as any);
                    }}
                    >
                        <Subheader text={"@" + (props.post.ext.user?.handle || "NoUserAttached")} style={{ color: "black", fontWeight: "bold" }} />
                    </Pressable>
                    <View>
                        <ScrollView nestedScrollEnabled horizontal>
                            <View style={row}>
                                {(props.post.ext.user?.tags || ["No", "Tags", "Here"]).map((chip, i) =>
                                    <PrimaryChip isAlt key={i} label={chip} />)}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <AsyncPressable
                    onPress={async () => {
                        try {
                            const resp = await Api.Post.extensions.setBookmarked({
                                id: props.post._id,
                                is_bookmarked: !isBookmarked
                            });
                            setIsBookmarked(Boolean(resp.is_bookmarked));
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }}>
                    {!isBookmarked && <IconButton iconSource={BookmarkIcons.inactive} style={{ height: 24, width: 24, marginLeft: "auto", }} />}
                    {isBookmarked && <BookmarkActive style={{ height: 16, width: 16, marginLeft: "auto", marginRight: sizes.rem0_5 / 2 }} />}
                </AsyncPressable>
            </Pressable>
            <Pressable onPress={() => {
                nav.navigate("PostScreen", {
                    post
                }) 
            }} style={{ paddingHorizontal: postSidePad / 2 }}>
                <PostContentView post={post} />
            </Pressable>
            {(props.post._source.postType !== "tweet") &&
                <View style={[row, { alignItems: "center", marginTop: "auto", borderTopColor: "#ccc", borderTopWidth: 1 }]}>
                    {showStatus && <View style={{ position: "absolute", backgroundColor: "black", opacity: 0.6, width: 100, margin: "auto", top: 12, left: 0, borderRadius: 8, right: 0, padding: 4 }}><Text style={{ width: "100%", textAlign: "center", color: "white" }}>Upvoted!</Text></View>}
                    <Button style={{ marginLeft: "auto", paddingHorizontal: 0 }} appearance={'ghost'} accessoryLeft={(props: any) => <CommentIcon height={24} width={24} style={{ height: 24, width: 24, }} />} >-</Button>
                    {<Button
                        style={{ paddingHorizontal: 0 }}
                        onPress={() => {
                            if (!isUpvoted)
                                setShowStatus(true);
                            Api.Post.extensions.setUpvoted({
                                id: post._id,
                                is_upvoted: !isUpvoted
                            }).then((r) => {
                                if (r.is_upvoted)
                                    setTimeout(() => {
                                        setShowStatus(false)
                                    }, 1333);
                                setIsUpvoted(r.is_upvoted);
                            });
                        }}
                        accessoryLeft={(props: any) => <UpvoteIcon height={24} width={24} style={{ height: 24, width: 24, opacity: isUpvoted ? 1 : 0.25 }} />} appearance={"ghost"} >{
                            isUpvoted ? "1" : " "
                        }</Button>}
                </View>}
        </View>
    </View >
}


const SubstackView = (props: { post: Interface.IElasticPost }) => {
    const { post } = props;
    return <View style={{ marginVertical: sizes.rem1, marginHorizontal: sizes.rem0_5 }}>
        <View key="profile" style={{ display: "flex", flexDirection: "row", marginBottom: sizes.rem1, }}>
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}
            {/* <a href={post._source.postUrl} style={{ display: "flex", flexDirection: "row", textDecoration: "none" }}>
                <IconifyIcon style={{ width: 30, height: 30, marginTop: 2, marginRight: sizes.rem1 / 1.5 }} svgProps={{ style: { margin: "auto" } }} icon={social.SubstackLogo} currentColor={socialStyle.substackColor} />
                {<Subheader text={post._source.content.title || ""} style={{ color: "black", fontSize: fonts.medium, fontWeight: "600", fontFamily: "K2D" }}></Subheader>}
            </a> */}
            {/* <View style={{}}>
                <Text style={{ fontSize: fonts.small, 
                    fontFamily: "K2D", 
                    fontWeight: "bold", textAlignVertical: "center" }}>
                </Text>
            </View> */}

        </View>
        {<Text key="content" style={{ fontSize: fonts.small }}>{post._source.content.description}</Text>}
        {<Text key="date" style={{ fontSize: fonts.xSmall, 
            //fontFamily: "K2D", 
            paddingVertical: 5 }}>{new Date(Date.parse(post._source.platformCreatedAt)).toLocaleString()}</Text>}
    </View>
}

const PostContentView = (props: { post: Interface.IElasticPost }) => {
    const { width: windowWidth, scale } = useWindowDimensions(),
        availWidth = windowWidth - spaceOnSide
    if (props.post._source.postType === 'substack') {
        return SubstackView(props)
    }
    return <HtmlView style={{ height: postInnerHeight(props.post, availWidth) }}
        isUrl={props.post._source.postType === "youtube" || props.post._source.postType === "spotify"}
    >{resolvePostContent(props.post, availWidth)}</HtmlView>
}